import { useRef, useState } from 'react'
import { useData } from '../context/DataContext'
import { useToast } from '../context/ToastContext'
import {
  exportBackupFile,
  exportJJSessionsCsvFile,
  exportWorkoutsCsvFile,
  parseBackupFile,
  readFileAsText,
  type ImportedBackup,
} from '../lib/backup'
import { Card, PrimaryButton, SecondaryButton, SectionTitle } from './ui'

export function BackupSection() {
  const { workouts, jjSessions, replaceAll } = useData()
  const { showToast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [pendingImport, setPendingImport] = useState<ImportedBackup | null>(null)
  const [importError, setImportError] = useState<string | null>(null)

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setImportError(null)
    try {
      const text = await readFileAsText(file)
      const data = parseBackupFile(text)
      setPendingImport(data)
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Não foi possível ler o arquivo.')
    }
  }

  function confirmImport() {
    if (!pendingImport) return
    replaceAll(pendingImport)
    setPendingImport(null)
    showToast('Backup importado com sucesso')
  }

  return (
    <div className="mb-8">
      <SectionTitle>Backup e exportação</SectionTitle>
      <Card className="space-y-3">
        <p className="text-xs text-slate-400">
          Seus dados ficam só neste aparelho/navegador. Exporte um backup regularmente para não correr o risco de perdê-los.
        </p>

        <SecondaryButton
          onClick={() => {
            exportBackupFile()
            showToast('Backup exportado')
          }}
        >
          ⬇ Exportar backup (JSON)
        </SecondaryButton>

        <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={handleFileSelected} />
        <SecondaryButton onClick={() => fileInputRef.current?.click()}>⬆ Importar backup</SecondaryButton>

        {importError && <p className="text-sm text-red-400">{importError}</p>}

        {pendingImport && (
          <Card className="border-red-700 bg-red-500/5">
            <p className="mb-3 text-sm text-red-200">
              Importar este arquivo vai <strong>substituir todos os dados atuais</strong> (programa, treinos e sessões de jiu-jitsu). Essa ação
              não pode ser desfeita.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <SecondaryButton onClick={() => setPendingImport(null)}>Cancelar</SecondaryButton>
              <PrimaryButton onClick={confirmImport} className="bg-red-500 text-white">
                Confirmar
              </PrimaryButton>
            </div>
          </Card>
        )}

        <div className="border-t border-slate-800 pt-3">
          <p className="mb-2 text-xs text-slate-400">Exportar para planilha (CSV):</p>
          <div className="space-y-2">
            <SecondaryButton
              onClick={() => {
                if (workouts.length === 0) {
                  showToast('Nenhum treino registrado ainda', 'info')
                  return
                }
                exportWorkoutsCsvFile(workouts)
                showToast('CSV de treinos exportado')
              }}
            >
              📄 Exportar treinos (CSV)
            </SecondaryButton>
            <SecondaryButton
              onClick={() => {
                if (jjSessions.length === 0) {
                  showToast('Nenhuma sessão de jiu-jitsu registrada ainda', 'info')
                  return
                }
                exportJJSessionsCsvFile(jjSessions)
                showToast('CSV de jiu-jitsu exportado')
              }}
            >
              📄 Exportar jiu-jitsu (CSV)
            </SecondaryButton>
          </div>
        </div>
      </Card>
    </div>
  )
}
