"""
preprocessing.py — Shared data preprocessing pipeline for the Campus Navigation project.

This module is the single source of truth for all data loading, splitting, and
preprocessing logic. Import `get_datasets` in any training notebook to get
ready-to-use tf.data pipelines without duplicating code.

Usage:
    from src.preprocessing import get_datasets

    train_ds, val_ds, test_ds = get_datasets()
"""

import random
from pathlib import Path

import numpy as np
import tensorflow as tf
from PIL import Image, ImageOps
from sklearn.model_selection import train_test_split

# Reproducibility — fixed seed ensures the same train/val/test split every run
RANDOM_SEED = 42
random.seed(RANDOM_SEED)
np.random.seed(RANDOM_SEED)
tf.random.set_seed(RANDOM_SEED)

# MobileNetV2 expects a fixed input resolution of 224x224
IMAGE_SIZE = (224, 224)

# Number of images per mini-batch — 32 balances memory usage and gradient stability
BATCH_SIZE = 32

# Dataset root — one sub-folder per building class
DATASET_DIR = Path(__file__).resolve().parent.parent / "dataset"

# Valid image extensions — used to skip macOS .DS_Store and other non-image files
IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".heic", ".bmp", ".tiff"}

# tf.data AUTOTUNE lets TensorFlow pick optimal buffer sizes at runtime
AUTOTUNE = tf.data.AUTOTUNE


def load_dataset(dataset_dir=DATASET_DIR):
    """
    Scans the dataset directory and builds parallel lists of image paths and labels.

    Args:
        dataset_dir : Path to the root folder containing one sub-folder per class.

    Returns:
        image_paths : numpy array of absolute image file path strings
        labels      : numpy array of integer class indices (0 to N-1)
        class_names : sorted list of class name strings (e.g. ["2", "3", "4", ...])
        class_to_idx: dict mapping class name to integer index (e.g. {"2": 0, ...})
    """
    # Sort class folders numerically so the index is consistent across runs
    class_names = sorted(
        [d.name for d in dataset_dir.iterdir() if d.is_dir()],
        key=int
    )

    class_to_idx = {name: idx for idx, name in enumerate(class_names)}

    image_paths = []
    labels = []

    for class_name in class_names:
        class_dir = dataset_dir / class_name
        for img_path in sorted(class_dir.iterdir()):
            # Skip non-image files such as .DS_Store
            if img_path.suffix.lower() not in IMAGE_EXTS:
                continue
            image_paths.append(str(img_path))
            labels.append(class_to_idx[class_name])

    return np.array(image_paths), np.array(labels), class_names, class_to_idx


def split_dataset(image_paths, labels):
    """
    Splits the dataset into train (70%), validation (15%), and test (15%) subsets.

    Uses stratified splitting to ensure each subset contains the same class
    proportions as the full dataset — important for minority classes like Building 4.

    Args:
        image_paths : numpy array of image file path strings
        labels      : numpy array of integer class labels

    Returns:
        X_train, X_val, X_test : path arrays for each split
        y_train, y_val, y_test : label arrays for each split
    """
    # Step 1: split into train (70%) and a temporary set (30%)
    X_train, X_temp, y_train, y_temp = train_test_split(
        image_paths, labels,
        test_size=0.30,
        stratify=labels,
        random_state=RANDOM_SEED
    )

    # Step 2: split the temporary set evenly into val (15%) and test (15%)
    X_val, X_test, y_val, y_test = train_test_split(
        X_temp, y_temp,
        test_size=0.50,
        stratify=y_temp,
        random_state=RANDOM_SEED
    )

    return X_train, X_val, X_test, y_train, y_val, y_test


def load_and_preprocess(path, label):
    """
    Loads a single image from disk and prepares it for MobileNetV2.

    Steps:
        1. Open image with PIL and apply EXIF orientation correction
           (iPhone photos store rotation as metadata rather than rotating pixels)
        2. Convert to RGB to ensure 3 channels regardless of source format
        3. Resize to IMAGE_SIZE (224x224) using bilinear interpolation
        4. Apply MobileNetV2 normalisation: scales pixels from [0, 255] to [-1, 1]

    Args:
        path  : tf.string tensor — absolute path to the image file
        label : tf.int64 tensor  — integer class index

    Returns:
        image : float32 tensor of shape (224, 224, 3), values in [-1, 1]
        label : unchanged int64 tensor
    """
    def _load_with_exif(path_bytes):
        # Decode tensor bytes to a Python string path that PIL can open
        img_path = path_bytes.numpy().decode("utf-8")
        with Image.open(img_path) as img:
            # Physically rotate pixels to match EXIF orientation metadata
            img = ImageOps.exif_transpose(img)
            img = img.convert("RGB")
            img = img.resize(IMAGE_SIZE, Image.BILINEAR)
        return np.array(img, dtype=np.float32)

    # tf.py_function allows running Python/PIL code inside a tf.data pipeline
    image = tf.py_function(_load_with_exif, [path], tf.float32)

    # Restore static shape so downstream model layers know the tensor dimensions
    image.set_shape([IMAGE_SIZE[0], IMAGE_SIZE[1], 3])

    # Scale pixels from [0, 255] to [-1, 1] as expected by MobileNetV2 weights
    image = tf.keras.applications.mobilenet_v2.preprocess_input(image)

    return image, label


def build_pipeline(paths, labels, shuffle=False):
    """
    Wraps a split into an efficient tf.data.Dataset pipeline.

    Pipeline stages:
        1. from_tensor_slices — pairs each path with its label
        2. shuffle (train only) — randomises order each epoch
        3. map — loads and preprocesses each image in parallel
        4. batch — groups images into mini-batches
        5. prefetch — prepares next batch while GPU trains on current one

    Args:
        paths   : numpy array of image file path strings
        labels  : numpy array of integer class labels
        shuffle : if True, shuffles before batching (set True for train split only)

    Returns:
        A batched, prefetched tf.data.Dataset of (image, label) pairs.
    """
    dataset = tf.data.Dataset.from_tensor_slices((paths, labels))

    if shuffle:
        # Buffer size equal to full split length guarantees a truly random shuffle
        dataset = dataset.shuffle(buffer_size=len(paths), seed=RANDOM_SEED)

    dataset = dataset.map(load_and_preprocess, num_parallel_calls=AUTOTUNE)
    dataset = dataset.batch(BATCH_SIZE)

    # Prefetch overlaps batch preparation with model training to keep GPU busy
    dataset = dataset.prefetch(AUTOTUNE)

    return dataset


def get_datasets(dataset_dir=DATASET_DIR):
    """
    Top-level function — runs the full preprocessing pipeline and returns
    ready-to-use tf.data pipelines for all three splits.

    This is the main entry point for training notebooks:

        from src.preprocessing import get_datasets, CLASS_NAMES
        train_ds, val_ds, test_ds = get_datasets()

    Args:
        dataset_dir : optional override for the dataset root path

    Returns:
        train_ds    : shuffled, batched tf.data.Dataset for training
        val_ds      : batched tf.data.Dataset for validation
        test_ds     : batched tf.data.Dataset for final evaluation
        class_names : list of class name strings (e.g. ["2", "3", ...])
    """
    image_paths, labels, class_names, _ = load_dataset(dataset_dir)
    X_train, X_val, X_test, y_train, y_val, y_test = split_dataset(image_paths, labels)

    train_ds = build_pipeline(X_train, y_train, shuffle=True)
    val_ds   = build_pipeline(X_val,   y_val,   shuffle=False)
    test_ds  = build_pipeline(X_test,  y_test,  shuffle=False)

    return train_ds, val_ds, test_ds, class_names
