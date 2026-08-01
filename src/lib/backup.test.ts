import { beforeEach, describe, expect, it } from "vitest"

import {
  importOdontomaBackup
} from "@/lib/backup"

import {
  installLocalStorageMock
} from "@/test/localStorageMock"

function backupFile(localStorageData: Record<string, string>) {
  return new File([
    JSON.stringify({
      app: "Odontoma",
      version: 1,
      exportedAt: new Date().toISOString(),
      localStorage: localStorageData
    })
  ], "backup.json", { type: "application/json" })
}

describe("backup restore", () => {
  beforeEach(() => {
    installLocalStorageMock()
  })

  it("reemplaza el estado anterior y elimina claves obsoletas", async () => {
    localStorage.setItem("odontoma_old", JSON.stringify({ stale: true }))
    localStorage.setItem("unrelated", "se conserva")

    await importOdontomaBackup(backupFile({
      odontoma_stats: JSON.stringify({ totalAnswered: 2 })
    }))

    expect(localStorage.getItem("odontoma_old")).toBeNull()
    expect(localStorage.getItem("odontoma_stats")).toBe('{"totalAnswered":2}')
    expect(localStorage.getItem("unrelated")).toBe("se conserva")
  })

  it("rechaza datos dañados sin tocar el estado actual", async () => {
    localStorage.setItem("odontoma_stats", JSON.stringify({ safe: true }))

    await expect(importOdontomaBackup(backupFile({
      odontoma_stats: "{roto"
    }))).rejects.toThrow("datos dañados")

    expect(localStorage.getItem("odontoma_stats")).toBe('{"safe":true}')
  })
})
