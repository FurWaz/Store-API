import * as nodemailer from "nodemailer";
import Config from "./Config.ts";
import Mail from "./Mail.ts";

export default class Mailer {
    private static transporter: nodemailer.Transporter;

    /**
     * Send a mail to a client using the mailer transporter
     * @param to Client email address (ex: mail@furwaz.com)
     * @param mail The mail object to send
     */
    public static async sendMail(to: string, mail: Mail) {
        const transporter = await this.getTransporter();

        if (!transporter) {
            console.error('Error : Cannot get mail transporter');
            return;
        }

        try {
            const infos = await new Promise((resolve, reject) => {
                transporter.sendMail({
                    from: Config.mail.from,
                    to,
                    subject: mail.subject,
                    html: mail.html,
                    text: mail.text,
                    attachments: mail.attachments
                }, (err, infos) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(infos);
                });
            });
        } catch (err) {
            console.error('Error : Cannot send mail : ');
            console.error(`err = ${err}\n${JSON.stringify(err, null, 2)}`);
            return false;
        }

        return true;
    }

    /**
     * Creates a mailer transporter or returns an existing one
     * @returns The mailer transporter
     */
    public static async getTransporter(): Promise<nodemailer.Transporter> {
        return new Promise((resolve) => {
            if (this.transporter) {
                resolve(this.transporter);
                return;
            }
            this.transporter = nodemailer.createTransport({
                host: Config.mail.host,
                port: Config.mail.port,
                secure: Config.mail.secure,
                auth: {
                    user: Config.mail.user,
                    pass: Config.mail.password
                }
            });
            resolve(this.transporter);
        });
    }
}
