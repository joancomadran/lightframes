/*
 * Minimal ZIP writer for multi-photo downloads. Entries are stored, not
 * deflated: JPEG / PNG / WebP are already compressed, so deflate would only
 * cost time. Names are UTF-8. No ZIP64, so the archive must stay under 4 GB.
 */

const CRC_TABLE = (() => {
  const table = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    table[n] = c >>> 0
  }
  return table
})()

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff
  for (let i = 0; i < bytes.length; i++) crc = CRC_TABLE[(crc ^ bytes[i]!) & 0xff]! ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}

/** MS-DOS date and time fields, as ZIP stores them. */
function dosDateTime(date: Date): { time: number; day: number } {
  return {
    time: (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2),
    day: ((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate(),
  }
}

/** "photo.jpg", "photo.jpg" → "photo.jpg", "photo (2).jpg": a ZIP may not hold two entries with one name. */
function uniqueNames(names: string[]): string[] {
  const seen = new Map<string, number>()
  return names.map((name) => {
    const key = name.toLowerCase()
    const count = (seen.get(key) ?? 0) + 1
    seen.set(key, count)
    if (count === 1) return name
    const dot = name.lastIndexOf('.')
    return dot > 0 ? `${name.slice(0, dot)} (${count})${name.slice(dot)}` : `${name} (${count})`
  })
}

const MAX_ZIP_BYTES = 0xffffffff

/** Pack files into one ZIP; the result is built from the original blobs, not a copy of them. */
export async function zipFiles(files: { name: string; data: Blob }[], date = new Date()): Promise<Blob> {
  const encoder = new TextEncoder()
  const { time, day } = dosDateTime(date)
  const names = uniqueNames(files.map((f) => f.name))
  const parts: BlobPart[] = []
  const central: Uint8Array<ArrayBuffer>[] = []
  let offset = 0

  for (const [index, file] of files.entries()) {
    const name = encoder.encode(names[index]!) as Uint8Array<ArrayBuffer>
    const crc = crc32(new Uint8Array(await file.data.arrayBuffer()))
    const size = file.data.size

    const local = new DataView(new ArrayBuffer(30))
    local.setUint32(0, 0x04034b50, true) // local file header
    local.setUint16(4, 20, true) // version needed
    local.setUint16(6, 0x0800, true) // UTF-8 names
    local.setUint16(8, 0, true) // stored
    local.setUint16(10, time, true)
    local.setUint16(12, day, true)
    local.setUint32(14, crc, true)
    local.setUint32(18, size, true)
    local.setUint32(22, size, true)
    local.setUint16(26, name.length, true)
    local.setUint16(28, 0, true)

    const entry = new DataView(new ArrayBuffer(46))
    entry.setUint32(0, 0x02014b50, true) // central directory header
    entry.setUint16(4, 20, true) // made by
    entry.setUint16(6, 20, true) // version needed
    entry.setUint16(8, 0x0800, true)
    entry.setUint16(10, 0, true)
    entry.setUint16(12, time, true)
    entry.setUint16(14, day, true)
    entry.setUint32(16, crc, true)
    entry.setUint32(20, size, true)
    entry.setUint32(24, size, true)
    entry.setUint16(28, name.length, true)
    entry.setUint32(42, offset, true) // where the local header starts
    const record = new Uint8Array(46 + name.length)
    record.set(new Uint8Array(entry.buffer), 0)
    record.set(name, 46)
    central.push(record)

    parts.push(local.buffer, name, file.data)
    offset += 30 + name.length + size
    if (offset > MAX_ZIP_BYTES) throw new Error('Too much to fit in one ZIP (4 GB)')
  }

  const centralSize = central.reduce((sum, r) => sum + r.length, 0)
  const end = new DataView(new ArrayBuffer(22))
  end.setUint32(0, 0x06054b50, true) // end of central directory
  end.setUint16(8, files.length, true)
  end.setUint16(10, files.length, true)
  end.setUint32(12, centralSize, true)
  end.setUint32(16, offset, true)
  return new Blob([...parts, ...central, end.buffer], { type: 'application/zip' })
}
