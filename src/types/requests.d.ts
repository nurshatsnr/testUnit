export interface UpdateRecipientRequest {
    
        signature_id: string,
        recipient_id: string,
        email: string,
        name: string,
        contractor_user_identifier: string,
        program_identifier: string,
        override: boolean
    
}

export type DocuSignEnvelopeInformation = string