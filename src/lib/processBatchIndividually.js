/**
 * Process a batch one item at a time and isolate failures per item.
 * Sequential execution intentionally limits peak memory for large RAW files.
 *
 * @template T, E
 * @param {E[]} items
 * @param {(item: E) => Promise<T>} processItem
 * @returns {Promise<{ successful: T[], failed: Array<{ item: E, error: unknown }> }>}
 */
export async function processBatchIndividually(items, processItem) {
  const successful = [];
  const failed = [];

  for (const item of items) {
    try {
      successful.push(await processItem(item));
    } catch (error) {
      failed.push({ item, error });
    }
  }

  return { successful, failed };
}
