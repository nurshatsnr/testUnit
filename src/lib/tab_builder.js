// External functions and modules are not rewritten
const Hancock = require('hancock');  // Assuming Hancock is an external library

// TabBuilder function in place of the class
function TabBuilder(recipient) {
  const anchors = new AnchorText(recipient.name); // External AnchorText class
  const recipientType = recipient["recipient_type"];

  // Function to return tabs based on recipient type
  function tabs() {
    return recipientType === "signer" ? buildAnchorTabs() : [];
  }

  // Private function to build anchor tabs for signers
  function buildAnchorTabs() {
    const theTabs = [];

    // Process signer_info (signature, initials, date)
    signerInfo().forEach(([type, text]) => {
      theTabs.push(signerTab({ type, text }));
    });

    // Process signer_checkboxes (checkboxes)
    signerCheckboxes().forEach(([type, text]) => {
      theTabs.push(checkboxTab({ type, text }));
    });

    // Add financed amount and signer attachment tabs
    theTabs.push(financedAmountTab());
    theTabs.push(signerAttachmentTab());

    // Process lender_info (lender fields)
    lenderInfo().forEach(([type, text, index, width]) => {
      theTabs.push(lenderTab({ type, text, index, width: width || 150 }));
    });

    return theTabs;
  }

  // Helper function for signer info
  function signerInfo() {
    return [
      ["sign_here", anchors.signature],
      ["initial_here", anchors.initials],
      ["date_signed", anchors.date]
    ];
  }

  // Function to build signer tabs
  function signerTab({ type, text }) {
    return new Hancock.AnchoredTab({   // External Hancock.AnchoredTab
      type,
      anchor_text: text,
      coordinates: [0, 10]
    });
  }

  // Helper function for signer checkboxes
  function signerCheckboxes() {
    return [
      ["checkbox", anchors.payment_to_third_party_checkbox],
      ["checkbox", anchors.intend_to_apply_for_incentives_checkbox]
    ];
  }

  // Function to build checkbox tabs
  function checkboxTab({ type, text }) {
    return new Hancock.AnchoredTab({   // External Hancock.AnchoredTab
      type,
      anchor_text: text,
      coordinates: [0, -3]
    });
  }

  // Function to create financed amount tab
  function financedAmountTab() {
    return new Hancock.AnchoredTab({   // External Hancock.AnchoredTab
      type: "text",
      anchor_text: anchors.financed_project_amount_field,
      coordinates: [0, -3],
      width: 150
    });
  }

  // Function to create signer attachment tab
  function signerAttachmentTab() {
    return new Hancock.AnchoredTab({   // External Hancock.AnchoredTab
      type: "signer_attachment",
      anchor_text: anchors.signer_attachment,
      coordinates: [0, 0],
      optional: true
    });
  }

  // Helper function for lender info
  function lenderInfo() {
    const result = [];
    for (let i = 1; i <= 3; i++) {
      result.push(["text", anchors.lender_company_name(i), i]);
      result.push(["text", anchors.lender_address(i), i]);
      result.push(["text", anchors.lender_city(i), i]);
      result.push(["text", anchors.lender_state(i), i, 2]);
      result.push(["text", anchors.lender_zip(i), i]);
      result.push(["text", anchors.lender_account_number(i), i]);
    }
    return result;
  }

  // Function to create lender tabs
  function lenderTab({ type, text, index, width }) {
    return new Hancock.AnchoredTab({   // External Hancock.AnchoredTab
      type,
      anchor_text: text,
      coordinates: [0, -3],
      width,
      label: text,
      required: index === 1  // Only require fields for the first lender
    });
  }

  // Return tabs function
  return {
    tabs
  };
}

module.exports = TabBuilder;
