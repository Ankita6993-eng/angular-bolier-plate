import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class StorageService {
    constructor() { }

    /**
     *
     * @param key Key to set in localStorage
     * @param value Data to set in localStorage
     * @description Encrypts data and stores in localStorage
     */
    static setData(key: string, value: any) {
        try {
            const dataToString = (typeof value === 'object') ? JSON.stringify(value) : value;
            const dataToEncrypt = {
                type: (typeof value),
                value: dataToString
            };
            const encryptedData = CryptoJS.AES.encrypt(JSON.stringify(dataToEncrypt), environment.cryptoSecret).toString();
            localStorage.setItem(key, encryptedData);
        } catch (error) {
            return null;
        }
    }

    /**
     *
     * @param key Key to get from localStorage
     * @description Returns decrypted and parsed data for specified field from localStorage
     */
    static getData(key: string) {
        try {
            const storedData = localStorage.getItem(key);
            if (storedData) {
                const bytes = CryptoJS.AES.decrypt(storedData, environment.cryptoSecret);
                const decoded = bytes.toString(CryptoJS.enc.Utf8);
                const parsedData: { type: string, value: any } = JSON.parse(decoded);
                if (parsedData.value) {
                    const valueType = parsedData.type;
                    return valueType === 'object' ? JSON.parse(parsedData.value) : parsedData.value;
                }
                return null;
            } else {
                return null;
            }
        } catch (error) {
            return null;
        }
    }

    /**
     *
     * @param key Key to remove from localStorage
     * @description Removes specified field from localStorage
     */
    static removeData(key: string) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            return false;
        }
    }
}
