export type ProjectStatus = 'mulighetsstudie' | 'regulering' | 'prosjektering' | 'salg'

export interface AnalysisItem {
  score: number
  label: string
  description: string
}

export interface Project {
  id: string
  name: string
  location: string
  address: string
  coordinates: [number, number]
  status: ProjectStatus
  bra_m2: number
  units: number
  floors: number
  zoning_status: string
  zoning_code: string
  description: string
  completion_year: number
  investment_mnok: number
  analysis: {
    sol: AnalysisItem
    støy: AnalysisItem
    flom: AnalysisItem
    fjernvirkning: AnalysisItem
  }
  unreal_stream_url?: string | null
  unreal_model_id?: string | null
  bim_file_url?: string | null
  created_at?: string
  documents?: Array<{
    id: string
    filename: string
    created_at: string
    chunks?: number
  }>
}
