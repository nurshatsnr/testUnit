// docuSignPrefix.js
const DOCUSIGN_TABLE_PREFIX = 'docu_sign_';

function tableName(name) {
  return DOCUSIGN_TABLE_PREFIX + name;
}

module.exports = tableName;
