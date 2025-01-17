import fs from 'fs';
import Formatter from './Formatter.ts';
import { Attachment } from 'nodemailer/lib/mailer/index.js';

interface JSONMail {
    subject: string;
    text: string;
    html: string;
    attachments?: Attachment[];
}

export default class Mail {
    /**
     * Creates a mail object from an HTML file with specified variables
     * @param subject The mail subject
     * @param path The source HTML file to read mail template from
     * @param assigns The variables to replace in the template
     * @param attachments The attachments to add to the mail
     * @returns The mail object corresponding to the JSON file
     */
    public static fromFile(subject: string, path: string, assigns: { [key: string]: string } = {}, attachments: Attachment[] = []): Mail {
        const datahtml = fs.readFileSync(path);
        const datatext = fs.readFileSync(path.replace('.html', '.txt'));
        const html = Formatter.formatString(datahtml.toString(), assigns);
        const text = Formatter.formatString(datatext.toString(), assigns);

        return Mail.fromJSON({
            subject: Formatter.formatString(subject, assigns),
            text: text,
            html: html,
            attachments: attachments
        });
    }

    /**
     * Creates a mail object from a JSON object
     * @param json The json object to use to create the mail
     * @returns The mail object corresponding to the JSON object
     */
    public static fromJSON(json: JSONMail): Mail {
        if (!json.subject || !json.text || !json.html) {
            throw new Error('Invalid mail JSON');
        }

        return new Mail(
            json.subject as string,
            json.text as string,
            json.html as string,
            json.attachments || []
        );
    }

    public subject: string;
    public text: string;
    public html: string;
    public attachments: Attachment[];

    public constructor(subject: string, text: string, html: string, attachments: Attachment[] = []) {
        this.subject = subject;
        this.text = text;
        this.html = html;
        this.attachments = attachments;
    }
}