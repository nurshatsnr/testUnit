// AnchorText class in Node.js
class AnchorText {
    constructor(signerIdentifier) {
      this.identifier = signerIdentifier;
    }
  
    // Public methods that generate anchor texts for various fields
    signature() {
      return this.anchorFor("signature");
    }
  
    date() {
      return this.anchorFor("date");
    }
  
    initials() {
      return this.anchorFor("initials");
    }
  
    paymentToThirdPartyCheckbox() {
      return this.anchorFor("pay_3rd_party");
    }
  
    intendToApplyForIncentivesCheckbox() {
      return this.anchorFor("apply_for_incentives");
    }
  
    financedProjectAmountField() {
      return this.anchorFor("financed_amount");
    }
  
    signerAttachment() {
      return this.anchorFor("signer_attachment");
    }
  
    lenderCompanyName(lenderNumber) {
      return this.lender(lenderNumber, "company_name");
    }
  
    lenderAddress(lenderNumber) {
      return this.lender(lenderNumber, "address");
    }
  
    lenderCity(lenderNumber) {
      return this.lender(lenderNumber, "city");
    }
  
    lenderState(lenderNumber) {
      return this.lender(lenderNumber, "state");
    }
  
    lenderZip(lenderNumber) {
      return this.lender(lenderNumber, "zip");
    }
  
    lenderAccountNumber(lenderNumber) {
      return this.lender(lenderNumber, "account_number");
    }
  
    // Private methods
  
    // Generates lender-specific anchor text
    lender(lenderNumber, field) {
      return this.anchorFor(`lender_${lenderNumber}_${field}_text`);
    }
  
    // Generates the sanitized signer identifier
    signer() {
      return this.identifier.trim().replace(/\s+/g, "_").replace(/[^\w]/g, "");
    }
  
    // Constructs the anchor text for a given type
    anchorFor(anchorType) {
      return `${this.signer()}_${anchorType}`;
    }
  }
  
  module.exports = AnchorText;
  