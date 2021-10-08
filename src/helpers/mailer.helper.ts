import * as ejs from "ejs";
import * as fs from "fs";
import * as path from "path";
import { createTransport } from "nodemailer";
import { minify } from "html-minifier";

const rootPath = path.join(__dirname, "..", "templates/");

const opts: any = {
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    type: "OAuth2",
    user: "support@bamiki.com",
    serviceClient: process.env.CLIENT_ID,
    privateKey: process.env.PRIVATE_KEY,
  },
};

// all templates here and can be easily used
const templates = {
  "code-template": "code-template.ejs",
  "update-template": "update-template.ejs",
};

const transport = createTransport(opts);

/**
 * Send email to given email(s)
 *
 * @param {{to: string | string[], subject: string, html: string, attachments?: [{filename: string, content: fs.ReadStream}]}} options
 * @returns
 */
export const sendEmail = (options: {
  html: any;
  subject: any;
  to: any;
  attachments?: any;
  from?: any;
}) => {
  const { to, subject, html, attachments, from } = options;

  return new Promise((resolve, reject) => {
    transport.sendMail(
      {
        from: from ? from : '"Bamiki Support" <support@bamiki.com>',
        to,
        subject,
        html,
        ...(attachments && { attachments }),
      },
      (error, info) => {
        if (error) {
          console.log("❌ ERROR SENDING EMAIL", error);
          return reject({ email_failed: true, error });
        }
        resolve({
          success: true,
          info,
        });
      }
    );
  });
};

/**
 * Compile ejs to plain html string. Pass template and data to use
 *
 * @param { {template: 'general-template'} } template
 * @returns
 */
export const compileEjs = (template: { template: string | number }) => {
  const text = fs.readFileSync(
    rootPath + templates[template.template],
    "utf-8"
  );

  /**
   * Closure to pass data to ejs
   * @param {*} data
   */
  const fn = (data) => {
    const html = ejs.compile(text)(data);

    return minify(html, { collapseWhitespace: true });
  };

  return fn;
};
