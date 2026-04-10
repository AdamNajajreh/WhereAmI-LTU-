"""
visualize.py — Helper functions for visualising model predictions.

Usage:
    from src.visualize import show_misclassified

    show_misclassified("baseline_mobilenetv2_best", test_ds, class_names)
"""

from pathlib import Path

import numpy as np
import matplotlib.pyplot as plt
import tensorflow as tf

# Path to the models directory relative to this file
MODELS_DIR = Path(__file__).resolve().parent.parent / "models"


def show_misclassified(model_name, dataset, class_names, max_images=20):
    """
    Loads a saved model and displays images that were incorrectly classified.

    Each image is shown with its true label and the model's wrong prediction.

    Args:
        model_name  : model filename without extension, e.g. "baseline_mobilenetv2_best"
        dataset     : a tf.data.Dataset split (e.g. test_ds, val_ds, train_ds)
        class_names : list of class name strings from get_datasets()
        max_images  : maximum number of misclassified images to display (default 20)
    """
    model_path = MODELS_DIR / f"{model_name}.keras"
    if not model_path.exists():
        raise FileNotFoundError(f"Model not found: {model_path}")

    print(f"Loading model: {model_name}")
    model = tf.keras.models.load_model(model_path)

    # Collect all images, true labels and predictions from the dataset
    all_images = []
    all_labels = []
    all_preds  = []

    for batch_images, batch_labels in dataset:
        preds = model.predict(batch_images, verbose=0)
        all_images.extend(batch_images.numpy())
        all_labels.extend(batch_labels.numpy())
        all_preds.extend(np.argmax(preds, axis=1))

    all_images = np.array(all_images)
    all_labels = np.array(all_labels)
    all_preds  = np.array(all_preds)

    # Find indices where the prediction does not match the true label
    wrong_idx = np.where(all_preds != all_labels)[0]

    total     = len(all_labels)
    num_wrong = len(wrong_idx)
    accuracy  = (total - num_wrong) / total * 100

    print(f"Total images:         {total}")
    print(f"Correctly classified: {total - num_wrong}")
    print(f"Misclassified:        {num_wrong}")
    print(f"Accuracy:             {accuracy:.2f}%")

    if num_wrong == 0:
        print("No misclassified images found.")
        return

    # Limit display to max_images
    display_idx = wrong_idx[:max_images]
    n_cols = 4
    n_rows = int(np.ceil(len(display_idx) / n_cols))

    fig, axes = plt.subplots(n_rows, n_cols, figsize=(4 * n_cols, 4 * n_rows))
    axes = axes.flatten()

    for i, idx in enumerate(display_idx):
        # Denormalise from MobileNetV2 range [-1, 1] back to [0, 255] for display
        img = (all_images[idx] + 1) * 127.5
        img = np.clip(img, 0, 255).astype(np.uint8)

        true_label = class_names[all_labels[idx]]
        pred_label = class_names[all_preds[idx]]

        axes[i].imshow(img)
        axes[i].axis("off")
        axes[i].set_title(
            f"True: Building {true_label}\nPred: Building {pred_label}",
            fontsize=9,
            color="red"
        )

    # Hide unused subplots
    for j in range(len(display_idx), len(axes)):
        axes[j].axis("off")

    plt.suptitle(
        f"Misclassified Images — {model_name}\n"
        f"{num_wrong}/{total} wrong  ({100 - accuracy:.2f}% error rate)",
        fontsize=12
    )
    plt.tight_layout()
    plt.show()
