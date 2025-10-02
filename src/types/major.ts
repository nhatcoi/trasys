// TypeScript interfaces for simplified Major JSON fields

export interface MajorCampus {
  campus_id: number;
  is_primary: boolean;
}

export interface MajorLanguage {
  lang: string;
  level: string;
}

export interface MajorModality {
  modality: string;
  note?: string;
}

export interface MajorAccreditation {
  scheme: string;
  level?: string;
  valid_from?: string;
  valid_to?: string;
  cert_no?: string;
  agency?: string;
  note?: string;
}

export interface MajorAlias {
  name: string;
  lang?: string;
  valid_from?: string;
  valid_to?: string;
}

export interface MajorDocument {
  doc_type: string;
  title: string;
  ref_no?: string;
  issued_by?: string;
  issued_at?: string;
  file_url?: string;
  note?: string;
}

export interface SimplifiedMajor {
  id: number;
  code: string;
  name_vi: string;
  name_en?: string;
  short_name?: string;
  slug?: string;
  national_code?: string;
  is_moet_standard?: boolean;
  degree_level: string;
  field_cluster?: string;
  specialization_model?: string;
  org_unit_id: number;
  parent_major_id?: number;
  duration_years?: number;
  total_credits_min?: number;
  total_credits_max?: number;
  semesters_per_year?: number;
  start_terms?: string;
  default_quota?: number;
  status: string;
  established_at?: string;
  closed_at?: string;
  description?: string;
  notes?: string;
  
  // JSON fields
  campuses?: MajorCampus[];
  languages?: MajorLanguage[];
  modalities?: MajorModality[];
  accreditations?: MajorAccreditation[];
  aliases?: MajorAlias[];
  documents?: MajorDocument[];
  
  created_by?: number;
  updated_by?: number;
  created_at?: string;
  updated_at?: string;
}

// Utility functions for working with JSON fields
export class MajorJSONHelper {
  static getPrimaryCampus(major: SimplifiedMajor): MajorCampus | null {
    return major.campuses?.find(c => c.is_primary) || major.campuses?.[0] || null;
  }

  static getMainLanguage(major: SimplifiedMajor): MajorLanguage | null {
    return major.languages?.find(l => l.level === 'main') || major.languages?.[0] || null;
  }

  static getPrimaryModality(major: SimplifiedMajor): MajorModality | null {
    return major.modalities?.[0] || null;
  }

  static getActiveAccreditations(major: SimplifiedMajor): MajorAccreditation[] {
    const now = new Date().toISOString().split('T')[0];
    return major.accreditations?.filter(acc => 
      (!acc.valid_from || acc.valid_from <= now) && 
      (!acc.valid_to || acc.valid_to >= now)
    ) || [];
  }

  static getActiveAliases(major: SimplifiedMajor): MajorAlias[] {
    const now = new Date().toISOString().split('T')[0];
    return major.aliases?.filter(alias => 
      (!alias.valid_from || alias.valid_from <= now) && 
      (!alias.valid_to || alias.valid_to >= now)
    ) || [];
  }

  static addCampus(major: SimplifiedMajor, campus: MajorCampus): void {
    if (!major.campuses) major.campuses = [];
    major.campuses.push(campus);
  }

  static removeCampus(major: SimplifiedMajor, campusId: number): void {
    if (major.campuses) {
      major.campuses = major.campuses.filter(c => c.campus_id !== campusId);
    }
  }

  static addLanguage(major: SimplifiedMajor, language: MajorLanguage): void {
    if (!major.languages) major.languages = [];
    major.languages.push(language);
  }

  static removeLanguage(major: SimplifiedMajor, lang: string): void {
    if (major.languages) {
      major.languages = major.languages.filter(l => l.lang !== lang);
    }
  }

  static addModality(major: SimplifiedMajor, modality: MajorModality): void {
    if (!major.modalities) major.modalities = [];
    major.modalities.push(modality);
  }

  static removeModality(major: SimplifiedMajor, modality: string): void {
    if (major.modalities) {
      major.modalities = major.modalities.filter(m => m.modality !== modality);
    }
  }
}

