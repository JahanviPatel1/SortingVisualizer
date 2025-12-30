/**
 * AlgorithmFactory.js
 * Implements Strategy Pattern with Generators for step-by-step visualization.
 * Each algorithm returns a generator yielding visualization steps.
 */

const ALGORITHMS = {
    BUBBLE: 'Bubble Sort',
    SELECTION: 'Selection Sort',
    INSERTION: 'Insertion Sort',
    QUICK: 'Quick Sort',
    MERGE: 'Merge Sort',
    HEAP: 'Heap Sort',
};

// --- Helper Functions ---
function swap(arr, i, j) {
    let temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
}

// --- Generator Algorithms ---
// Yields: { type: 'compare'|'swap'|'set'|'sorted'|'pivot', indices: [], values: [] }

function* bubbleSortGenerator(array) {
    let arr = [...array];
    let n = arr.length;

    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n - i - 1; j++) {
            yield { type: 'compare', indices: [j, j + 1] };

            if (arr[j] > arr[j + 1]) {
                swap(arr, j, j + 1);
                yield { type: 'swap', indices: [j, j + 1], values: [arr[j], arr[j + 1]] };
            }
        }
        yield { type: 'sorted', indices: [n - 1 - i] };
    }
    yield { type: 'sorted', indices: [0] };
}

function* selectionSortGenerator(array) {
    let arr = [...array];
    let n = arr.length;

    for (let i = 0; i < n; i++) {
        let minIdx = i;

        for (let j = i + 1; j < n; j++) {
            yield { type: 'compare', indices: [minIdx, j] };
            if (arr[j] < arr[minIdx]) {
                minIdx = j;
            }
        }

        if (minIdx !== i) {
            swap(arr, i, minIdx);
            yield { type: 'swap', indices: [i, minIdx], values: [arr[i], arr[minIdx]] };
        }
        yield { type: 'sorted', indices: [i] };
    }
}

function* insertionSortGenerator(array) {
    let arr = [...array];
    let n = arr.length;

    yield { type: 'sorted', indices: [0] };

    for (let i = 1; i < n; i++) {
        let key = arr[i];
        let j = i - 1;

        yield { type: 'compare', indices: [i, j] };

        while (j >= 0 && arr[j] > key) {
            yield { type: 'compare', indices: [j, j + 1] };

            arr[j + 1] = arr[j];
            yield { type: 'set', indices: [j + 1], values: [arr[j + 1]] };

            j = j - 1;
        }
        arr[j + 1] = key;
        yield { type: 'set', indices: [j + 1], values: [key] };
    }
    const allIndices = Array.from({ length: n }, (_, i) => i);
    yield { type: 'sorted', indices: allIndices };
}

function* quickSortGenerator(array) {
    let arr = [...array];
    let stack = [[0, arr.length - 1]];

    while (stack.length > 0) {
        let [low, high] = stack.pop();

        if (low >= high) {
            if (low >= 0 && low < arr.length) yield { type: 'sorted', indices: [low] };
            continue;
        }

        let pivot = arr[high];
        let i = low - 1;

        // Visual: Pivot highlight
        yield { type: 'pivot', indices: [high] };

        for (let j = low; j < high; j++) {
            yield { type: 'compare', indices: [j, high] };

            if (arr[j] < pivot) {
                i++;
                swap(arr, i, j);
                yield { type: 'swap', indices: [i, j], values: [arr[i], arr[j]] };
            }
        }

        swap(arr, i + 1, high);
        yield { type: 'swap', indices: [i + 1, high], values: [arr[i + 1], arr[high]] };

        let pIndex = i + 1;
        yield { type: 'sorted', indices: [pIndex] };

        if (pIndex + 1 < high) stack.push([pIndex + 1, high]);
        else if (high >= 0) yield { type: 'sorted', indices: [high] };

        if (low < pIndex - 1) stack.push([low, pIndex - 1]);
        else if (low >= 0) yield { type: 'sorted', indices: [low] };
    }
    yield { type: 'finished' };
}

// Merge Sort (Iterative)
function* mergeSortGenerator(array) {
    let arr = [...array];
    let n = arr.length;
    let buffer = new Array(n);

    for (let size = 1; size < n; size *= 2) {
        for (let leftStart = 0; leftStart < n; leftStart += 2 * size) {
            let mid = Math.min(leftStart + size, n);
            let rightEnd = Math.min(leftStart + 2 * size, n);

            let i = leftStart;
            let j = mid;
            let k = leftStart;

            // Visual: Highlight range being merged
            // yield { type: 'compare', indices: [leftStart, rightEnd - 1] }; 

            while (i < mid && j < rightEnd) {
                yield { type: 'compare', indices: [i, j] };
                if (arr[i] <= arr[j]) {
                    buffer[k++] = arr[i++];
                } else {
                    buffer[k++] = arr[j++];
                }
            }
            while (i < mid) {
                buffer[k++] = arr[i++];
            }
            while (j < rightEnd) {
                buffer[k++] = arr[j++];
            }

            // Copy back sorted segment
            for (let m = leftStart; m < rightEnd; m++) {
                arr[m] = buffer[m];
                yield { type: 'set', indices: [m], values: [arr[m]] };
            }
        }
    }

    yield { type: 'sorted', indices: Array.from({ length: n }, (_, i) => i) };
}

// Heap Sort
function* heapSortGenerator(array) {
    let arr = [...array];
    let n = arr.length;

    // Build heap (rearrange array)
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
        yield* heapify(arr, n, i);
    }

    // One by one extract an element from heap
    for (let i = n - 1; i > 0; i--) {
        // Move current root to end
        swap(arr, 0, i);
        yield { type: 'swap', indices: [0, i], values: [arr[0], arr[i]] };
        yield { type: 'sorted', indices: [i] };

        // Call max heapify on the reduced heap
        yield* heapify(arr, i, 0);
    }
    yield { type: 'sorted', indices: [0] };
}

function* heapify(arr, n, i) {
    let largest = i;
    let l = 2 * i + 1;
    let r = 2 * i + 2;

    if (l < n) {
        yield { type: 'compare', indices: [largest, l] };
        if (arr[l] > arr[largest]) largest = l;
    }

    if (r < n) {
        yield { type: 'compare', indices: [largest, r] };
        if (arr[r] > arr[largest]) largest = r;
    }

    if (largest !== i) {
        swap(arr, i, largest);
        yield { type: 'swap', indices: [i, largest], values: [arr[i], arr[largest]] };

        // Recursively heapify the affected sub-tree
        yield* heapify(arr, n, largest);
    }
}


class AlgorithmFactory {
    static getAlgorithm(type) {
        switch (type) {
            case ALGORITHMS.BUBBLE:
                return {
                    generator: bubbleSortGenerator,
                    complexity: { best: 'O(n)', avg: 'O(n²)', worst: 'O(n²)' }
                };
            case ALGORITHMS.SELECTION:
                return {
                    generator: selectionSortGenerator,
                    complexity: { best: 'O(n²)', avg: 'O(n²)', worst: 'O(n²)' }
                };
            case ALGORITHMS.INSERTION:
                return {
                    generator: insertionSortGenerator,
                    complexity: { best: 'O(n)', avg: 'O(n²)', worst: 'O(n²)' }
                };
            case ALGORITHMS.QUICK:
                return {
                    generator: quickSortGenerator,
                    complexity: { best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n²)' }
                };
            case ALGORITHMS.MERGE:
                return {
                    generator: mergeSortGenerator,
                    complexity: { best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n log n)' }
                };
            case ALGORITHMS.HEAP:
                return {
                    generator: heapSortGenerator,
                    complexity: { best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n log n)' }
                };
            default:
                throw new Error("Unknown Algorithm");
        }
    }
}

export { ALGORITHMS, AlgorithmFactory };
