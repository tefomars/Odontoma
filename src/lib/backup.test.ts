import { beforeEach, describe, expect, it, vi } from "vitest"

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
  it.each(["free", "fsrs"])("restaura el modo %s exportado como texto plano", async mode => {
    await importOdontomaBackup(backupFile({ odontoma_flashcard_study_mode_v1: mode }))
    expect(localStorage.getItem("odontoma_flashcard_study_mode_v1")).toBe(mode)
  })
  it("rechaza preferencias desconocidas y estructuras incompletas", async () => {
    await expect(importOdontomaBackup(backupFile({ odontoma_flashcard_study_mode_v1: "otro" }))).rejects.toThrow("modo")
    for (const value of [null, { app: "Odontoma", version: 1, localStorage: [] }]) {
      await expect(importOdontomaBackup(new File([JSON.stringify(value)], "bad.json"))).rejects.toThrow()
    }
  })
  it("revierte un fallo parcial por falta de espacio sin eliminar datos anteriores", async () => {
    localStorage.setItem("odontoma_stats", '{"safe":true}')
    localStorage.setItem("odontoma_old", "{}")
    const write = localStorage.setItem.bind(localStorage)
    const spy = vi.spyOn(localStorage, "setItem").mockImplementation((key, value) => {
      if (key === "odontoma_full") throw new Error("QuotaExceededError")
      write(key, value)
    })
    await expect(importOdontomaBackup(backupFile({ odontoma_stats: '{"new":true}', odontoma_full: "{}" }))).rejects.toThrow("se conservaron")
    expect(localStorage.getItem("odontoma_stats")).toBe('{"safe":true}')
    expect(localStorage.getItem("odontoma_old")).toBe("{}")
    spy.mockRestore()
  })
})
