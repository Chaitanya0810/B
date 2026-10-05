# B+ Tree File Index Demo

An educational B+ tree visualizer using a numbered, in-memory sample file set. It starts with 10 files (keys 10 through 100), lets you insert a file, and animates a search from the root page through index pages to a leaf file reference. Search key 50 is prefilled as an example.

## Run

Open `index.html` in a browser. Inserted files exist only in the current browser session and reset when the page reloads.

## Publish

The included GitHub Actions workflow deploys the project root to GitHub Pages whenever `main` is updated. For the `Chaitanya0810/bplus-tree-visualizer` repository, the site URL will be <https://chaitanya0810.github.io/bplus-tree-visualizer/>.

## Source

- Repository: https://github.com/sunrenjie/JavascriptVisualRelease
- B+ tree implementation: https://github.com/sunrenjie/JavascriptVisualRelease/blob/master/AlgorithmLibrary/BPlusTree.js
- Original USFCA visualization: https://www.cs.usfca.edu/~galles/visualization/BPlusTree.html
