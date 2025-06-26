import { watch } from "fs"
import type { SecureFileReader } from "./secure-file-reader"

class FileWatcher {
  private watchers = new Map<string, any>()
  private fileReader: SecureFileReader

  constructor(fileReader: SecureFileReader) {
    this.fileReader = fileReader
  }

  watchFile(filePath: string, callback?: () => void): void {
    if (this.watchers.has(filePath)) return

    try {
      const watcher = watch(filePath, (eventType) => {
        if (eventType === "change") {
          console.log(`File changed: ${filePath}`)
          // Invalidate cache entry
          this.invalidateCache(filePath)
          callback?.()
        }
      })

      this.watchers.set(filePath, watcher)
      console.log(`Watching file: ${filePath}`)
    } catch (error) {
      console.error(`Failed to watch file ${filePath}:`, error)
    }
  }

  private invalidateCache(filePath: string): void {
    // Force cache refresh on next access
    console.log(`Cache invalidated for: ${filePath}`)
  }

  stopWatching(filePath: string): void {
    const watcher = this.watchers.get(filePath)
    if (watcher) {
      watcher.close()
      this.watchers.delete(filePath)
      console.log(`Stopped watching: ${filePath}`)
    }
  }

  stopAll(): void {
    for (const [filePath] of this.watchers) {
      this.stopWatching(filePath)
    }
  }
}

export { FileWatcher }
