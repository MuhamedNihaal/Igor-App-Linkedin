require('dotenv').config();

const linkedinConfig = {
  clientId: process.env.LINKEDIN_CLIENT_ID,
  clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
  redirectUri: process.env.LINKEDIN_REDIRECT_URI || 'http://localhost:5000/api/linkedin/callback',
  scope: ['r_organization_social', 'w_organization_social', 'r_comments', 'w_comments']
};

module.exports = linkedinConfig;