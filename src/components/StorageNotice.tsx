import { useSyncExternalStore } from "react"
import { dismissStorageFailure, storageFailure, subscribeStorageFailure } from "@/lib/storageSafety"

export default function StorageNotice() {
  const message = useSyncExternalStore(subscribeStorageFailure, storageFailure, () => null)
  if (!message) return null
  return <aside role="alert" className="storage-notice"><p>{message}</p><button onClick={dismissStorageFailure}>Entendido</button></aside>
}
