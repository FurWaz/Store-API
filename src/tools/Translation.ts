import Joi from "joi";
import Lang from "./Lang.ts";

export const translationLanguages = ['en', 'fr', 'de', 'es', 'it'];

export const translatedTextSchema = Joi.object({
    en: Joi.string().optional(),
    fr: Joi.string().optional(),
    de: Joi.string().optional(),
    es: Joi.string().optional(),
    it: Joi.string().optional(),
});

export function getRequestLanguageCode() {
    const requestLang = Lang.getLanguage();
    if (translationLanguages.includes(requestLang))
        return requestLang;
    else return 'en'; // default language
}

type TranslationGetter<Type> = (languageCode: string) => Type;
export function findBestTranslation<Type>(getter: TranslationGetter<Type|null>): Type|null {
    const requestLang = getRequestLanguageCode();
    const result = getter(requestLang);
    if (result) return result;

    for (const languageCode of translationLanguages.filter(lang => lang !== requestLang)) {
        const result = getter(languageCode);
        if (result) return result;
    }

    return null;
}

type TranslationGetterAsync<Type> = (languageCode: string) => Promise<Type>;
export async function findBestTranslationAsync<Type>(getter: TranslationGetterAsync<Type|null>): Promise<Type|null> {
    const requestLang = getRequestLanguageCode();
    const result = await getter(requestLang);
    if (result) return result;

    for (const languageCode of translationLanguages.filter(lang => lang !== requestLang)) {
        const result = await getter(languageCode);
        if (result) return result;
    }

    return null;
}