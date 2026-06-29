export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.5'
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      body_metrics: {
        Row: {
          created_at: string
          date: string
          id: string
          notes: string | null
          photo_back_url: string | null
          photo_front_url: string | null
          photo_side_url: string | null
          updated_at: string
          user_id: string
          waist_cm: number | null
          weight_kg: number | null
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          notes?: string | null
          photo_back_url?: string | null
          photo_front_url?: string | null
          photo_side_url?: string | null
          updated_at?: string
          user_id: string
          waist_cm?: number | null
          weight_kg?: number | null
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          notes?: string | null
          photo_back_url?: string | null
          photo_front_url?: string | null
          photo_side_url?: string | null
          updated_at?: string
          user_id?: string
          waist_cm?: number | null
          weight_kg?: number | null
        }
        Relationships: []
      }
      daily_checkins: {
        Row: {
          alcohol_units: number | null
          calories: number | null
          created_at: string
          creatine_taken: boolean | null
          date: string
          fatigue: number | null
          id: string
          notes: string | null
          pain_area: string | null
          pain_score: number | null
          protein_g: number | null
          protein_supplement_taken: boolean | null
          readiness: number | null
          sleep_hours: number | null
          sleep_quality: number | null
          soreness: number | null
          steps: number | null
          stress: number | null
          updated_at: string
          user_id: string
          water_litres: number | null
          weight_kg: number | null
        }
        Insert: {
          alcohol_units?: number | null
          calories?: number | null
          created_at?: string
          creatine_taken?: boolean | null
          date: string
          fatigue?: number | null
          id?: string
          notes?: string | null
          pain_area?: string | null
          pain_score?: number | null
          protein_g?: number | null
          protein_supplement_taken?: boolean | null
          readiness?: number | null
          sleep_hours?: number | null
          sleep_quality?: number | null
          soreness?: number | null
          steps?: number | null
          stress?: number | null
          updated_at?: string
          user_id: string
          water_litres?: number | null
          weight_kg?: number | null
        }
        Update: {
          alcohol_units?: number | null
          calories?: number | null
          created_at?: string
          creatine_taken?: boolean | null
          date?: string
          fatigue?: number | null
          id?: string
          notes?: string | null
          pain_area?: string | null
          pain_score?: number | null
          protein_g?: number | null
          protein_supplement_taken?: boolean | null
          readiness?: number | null
          sleep_hours?: number | null
          sleep_quality?: number | null
          soreness?: number | null
          steps?: number | null
          stress?: number | null
          updated_at?: string
          user_id?: string
          water_litres?: number | null
          weight_kg?: number | null
        }
        Relationships: []
      }
      exercise_results: {
        Row: {
          actual_reps: number | null
          completed: boolean
          created_at: string
          distance_m: number | null
          duration_sec: number | null
          exercise_category: string | null
          exercise_name: string
          id: string
          notes: string | null
          planned_reps: string | null
          planned_sets: number | null
          rpe: number | null
          set_number: number
          training_session_id: string
          updated_at: string
          weight_kg: number | null
        }
        Insert: {
          actual_reps?: number | null
          completed?: boolean
          created_at?: string
          distance_m?: number | null
          duration_sec?: number | null
          exercise_category?: string | null
          exercise_name: string
          id?: string
          notes?: string | null
          planned_reps?: string | null
          planned_sets?: number | null
          rpe?: number | null
          set_number: number
          training_session_id: string
          updated_at?: string
          weight_kg?: number | null
        }
        Update: {
          actual_reps?: number | null
          completed?: boolean
          created_at?: string
          distance_m?: number | null
          duration_sec?: number | null
          exercise_category?: string | null
          exercise_name?: string
          id?: string
          notes?: string | null
          planned_reps?: string | null
          planned_sets?: number | null
          rpe?: number | null
          set_number?: number
          training_session_id?: string
          updated_at?: string
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'exercise_results_training_session_id_fkey'
            columns: ['training_session_id']
            isOneToOne: false
            referencedRelation: 'training_sessions'
            referencedColumns: ['id']
          },
        ]
      }
      plan_adjustments: {
        Row: {
          applied: boolean
          applied_at: string | null
          block_id: string | null
          change_type: string
          changes_json: Json | null
          created_at: string
          date: string
          effective_from: string | null
          field: string | null
          id: string
          new_value: string | null
          reason: string | null
          session_code: string | null
          source: string
          updated_at: string
          user_id: string
        }
        Insert: {
          applied?: boolean
          applied_at?: string | null
          block_id?: string | null
          change_type: string
          changes_json?: Json | null
          created_at?: string
          date: string
          effective_from?: string | null
          field?: string | null
          id?: string
          new_value?: string | null
          reason?: string | null
          session_code?: string | null
          source?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          applied?: boolean
          applied_at?: string | null
          block_id?: string | null
          change_type?: string
          changes_json?: Json | null
          created_at?: string
          date?: string
          effective_from?: string | null
          field?: string | null
          id?: string
          new_value?: string | null
          reason?: string | null
          session_code?: string | null
          source?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'plan_adjustments_block_id_fkey'
            columns: ['block_id']
            isOneToOne: false
            referencedRelation: 'training_blocks'
            referencedColumns: ['id']
          },
        ]
      }
      session_exercises: {
        Row: {
          created_at: string
          distance_m: number | null
          duration_sec: number | null
          exercise_category: string | null
          exercise_name: string
          id: string
          intensity: string | null
          notes: string | null
          reps: string | null
          rest_seconds: number | null
          session_template_id: string
          sets: number
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          distance_m?: number | null
          duration_sec?: number | null
          exercise_category?: string | null
          exercise_name: string
          id?: string
          intensity?: string | null
          notes?: string | null
          reps?: string | null
          rest_seconds?: number | null
          session_template_id: string
          sets?: number
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          distance_m?: number | null
          duration_sec?: number | null
          exercise_category?: string | null
          exercise_name?: string
          id?: string
          intensity?: string | null
          notes?: string | null
          reps?: string | null
          rest_seconds?: number | null
          session_template_id?: string
          sets?: number
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'session_exercises_session_template_id_fkey'
            columns: ['session_template_id']
            isOneToOne: false
            referencedRelation: 'session_templates'
            referencedColumns: ['id']
          },
        ]
      }
      session_templates: {
        Row: {
          block_id: string
          category: string
          compressed_version: Json | null
          created_at: string
          default_version: Json
          estimated_duration_min: number
          id: string
          intensity_target: string | null
          name: string
          priority: number
          purpose: string | null
          recovery_version: Json | null
          session_code: string
          updated_at: string
        }
        Insert: {
          block_id: string
          category: string
          compressed_version?: Json | null
          created_at?: string
          default_version?: Json
          estimated_duration_min?: number
          id?: string
          intensity_target?: string | null
          name: string
          priority?: number
          purpose?: string | null
          recovery_version?: Json | null
          session_code: string
          updated_at?: string
        }
        Update: {
          block_id?: string
          category?: string
          compressed_version?: Json | null
          created_at?: string
          default_version?: Json
          estimated_duration_min?: number
          id?: string
          intensity_target?: string | null
          name?: string
          priority?: number
          purpose?: string | null
          recovery_version?: Json | null
          session_code?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'session_templates_block_id_fkey'
            columns: ['block_id']
            isOneToOne: false
            referencedRelation: 'training_blocks'
            referencedColumns: ['id']
          },
        ]
      }
      training_blocks: {
        Row: {
          created_at: string
          end_date: string
          goal: string | null
          id: string
          name: string
          notes: string | null
          phase: string
          priority_order: Json | null
          start_date: string
          target_weight_max_kg: number | null
          target_weight_min_kg: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_date: string
          goal?: string | null
          id?: string
          name: string
          notes?: string | null
          phase: string
          priority_order?: Json | null
          start_date: string
          target_weight_max_kg?: number | null
          target_weight_min_kg?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_date?: string
          goal?: string | null
          id?: string
          name?: string
          notes?: string | null
          phase?: string
          priority_order?: Json | null
          start_date?: string
          target_weight_max_kg?: number | null
          target_weight_min_kg?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      training_sessions: {
        Row: {
          block_id: string | null
          completed_status: string
          created_at: string
          date: string
          duration_min: number
          energy_after_session: number | null
          id: string
          location: string | null
          notes: string | null
          pain_area: string | null
          pain_during_session: boolean | null
          pain_score: number | null
          planned_or_unplanned: string
          session_category: string
          session_code: string | null
          session_load: number
          session_name: string
          session_rpe: number
          session_template_id: string | null
          updated_at: string
          user_id: string
          warmup_completed: boolean | null
        }
        Insert: {
          block_id?: string | null
          completed_status?: string
          created_at?: string
          date: string
          duration_min: number
          energy_after_session?: number | null
          id?: string
          location?: string | null
          notes?: string | null
          pain_area?: string | null
          pain_during_session?: boolean | null
          pain_score?: number | null
          planned_or_unplanned?: string
          session_category: string
          session_code?: string | null
          session_load: number
          session_name: string
          session_rpe: number
          session_template_id?: string | null
          updated_at?: string
          user_id: string
          warmup_completed?: boolean | null
        }
        Update: {
          block_id?: string | null
          completed_status?: string
          created_at?: string
          date?: string
          duration_min?: number
          energy_after_session?: number | null
          id?: string
          location?: string | null
          notes?: string | null
          pain_area?: string | null
          pain_during_session?: boolean | null
          pain_score?: number | null
          planned_or_unplanned?: string
          session_category?: string
          session_code?: string | null
          session_load?: number
          session_name?: string
          session_rpe?: number
          session_template_id?: string | null
          updated_at?: string
          user_id?: string
          warmup_completed?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: 'training_sessions_block_id_fkey'
            columns: ['block_id']
            isOneToOne: false
            referencedRelation: 'training_blocks'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'training_sessions_session_template_id_fkey'
            columns: ['session_template_id']
            isOneToOne: false
            referencedRelation: 'session_templates'
            referencedColumns: ['id']
          },
        ]
      }
      watch_workouts: {
        Row: {
          active_kcal: number | null
          activity_type: string | null
          avg_hr: number | null
          created_at: string
          date: string
          distance_km: number | null
          duration_min: number | null
          hrv: number | null
          id: string
          max_hr: number | null
          raw_payload: Json | null
          resting_hr: number | null
          source: string
          steps: number | null
          updated_at: string
          user_id: string
          vo2max: number | null
        }
        Insert: {
          active_kcal?: number | null
          activity_type?: string | null
          avg_hr?: number | null
          created_at?: string
          date: string
          distance_km?: number | null
          duration_min?: number | null
          hrv?: number | null
          id?: string
          max_hr?: number | null
          raw_payload?: Json | null
          resting_hr?: number | null
          source?: string
          steps?: number | null
          updated_at?: string
          user_id: string
          vo2max?: number | null
        }
        Update: {
          active_kcal?: number | null
          activity_type?: string | null
          avg_hr?: number | null
          created_at?: string
          date?: string
          distance_km?: number | null
          duration_min?: number | null
          hrv?: number | null
          id?: string
          max_hr?: number | null
          raw_payload?: Json | null
          resting_hr?: number | null
          source?: string
          steps?: number | null
          updated_at?: string
          user_id?: string
          vo2max?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema['Enums'] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema['CompositeTypes'] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
