export const paymentPolicy=Object.freeze({operator:"Rainsoft Johann Prem",recipientEmail:"topdiveair@gmail.com",currency:"EUR",mode:"receive-only",livePaymentsEnabled:false,outboundPaymentsEnabled:false});
export function paymentReadiness({verifiedRecipient=false,legalReady=false,processorConnected=false}={}){return Boolean(paymentPolicy.livePaymentsEnabled&&verifiedRecipient&&legalReady&&processorConnected)}
export function assertOutboundPaymentForbidden(){throw new Error("Outbound payments are disabled for Rainsoft GastKompass")}
