/**
 * Type definitions for GraphQL entities
 */
export interface Archetype {
    id: string;
    code: string;
    name: string;
    coreDrive: string;
    primaryFear: string;
    languageSignature: string;
    psychologicalTriggers: string[];
}
export type PulseScriptType = 'OPENING' | 'RESPONSE' | 'RESOLUTION' | 'CUSTOM';
export interface PulseScript {
    id: string;
    code: string;
    name: string;
    type: PulseScriptType;
    description?: string;
    archetypeId: string;
    archetype?: Archetype;
}
export interface CreatePulseScriptInput {
    code: string;
    name: string;
    type: PulseScriptType;
    description?: string;
    archetypeId: string;
}
export interface UpdatePulseScriptInput {
    id: string;
    code?: string;
    name?: string;
    type?: PulseScriptType;
    description?: string;
    archetypeId?: string;
}
export interface Pulse {
    id: string;
    code: string;
    status: string;
    currentState: string;
    initiatorArchetype?: Archetype;
    targetArchetype?: Archetype;
}
