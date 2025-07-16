"use client"

import React from "react"
import { useTranslations } from "next-intl"

const ProfileInvoiceSettings = () => {
  const  t  = useTranslations("help")

  return (
    <div className="p-6 space-y-6">
      {/* Profil Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-4 rounded-2xl shadow">
        <div className="space-y-2">
          <label className="font-semibold">{t("Logo")}</label>
          <div className="border border-dashed rounded-xl flex items-center justify-center h-48">
            <span>{t("Drag file here")}</span>
          </div>
          <button className="bg-blue-500 text-white rounded-xl px-4 py-2 mt-2">{t("OR SELECT PHOTO")}</button>
        </div>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label>{t("Full Name")}</label>
            <input type="text" value="Manta Ray" className="input" readOnly />
          </div>
          <div>
            <label>{t("Address")}</label>
            <input
              type="text"
              value="Incubateur Supcom Technopole Ghazela Ariana Tunis"
              className="input"
              readOnly
            />
          </div>
          <div>
            <label>{t("Phone Number")}</label>
            <input type="text" value="+216 54131778" className="input" readOnly />
          </div>
          <div>
            <label>{t("Bank RIB")}</label>
            <input type="text" className="input" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label>{t("Company")}</label>
            <input type="text" value="Omnilink" className="input" readOnly />
          </div>
          <div>
            <label>{t("Email")}</label>
            <input type="text" value="omnilink.tn@gmail.com" className="input" readOnly />
          </div>
          <div>
            <label>{t("Website")}</label>
            <input type="text" value="http://www.Omnilink.tn/" className="input" readOnly />
          </div>
          <div>
            <label>{t("Bank Name")}</label>
            <input type="text" className="input" />
          </div>
        </div>
      </section>

      {/* General Section */}
      <section className="bg-white p-4 rounded-2xl shadow space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label>{t("Sound")}</label>
            <select className="input">
              <option>{t("Default Values")}</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label>{t("Mute")}</label>
            <input type="checkbox" />
          </div>
          <div>
            <label>{t("Language")}</label>
            <select className="input">
              <option>{t("French")}</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label>{t("Open PDF file after saving")}</label>
            <input type="checkbox" defaultChecked />
          </div>
        </div>
        <div>
          <label>{t("PDF Folder Save Location")}</label>
          <input type="text" value="C:\\Users\\rimba" className="input" readOnly />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label>{t("Template")}</label>
            <select className="input">
              <option>{t("Minimal")}</option>
            </select>
          </div>
          <div>
            <label>{t("Date Format")}</label>
            <select className="input">
              <option>{t("07/02/2025 (MM/DD/YYYY)")}</option>
            </select>
          </div>
        </div>
      </section>

      {/* Invoice Section */}
      <section className="bg-white p-4 rounded-2xl shadow space-y-4">
        <div className="flex flex-wrap gap-4">
          {[
            t("Invoice Number"),
            t("Due Date"),
            t("Currency"),
            t("Discount"),
            t("Tax"),
            t("Note"),
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <label>{item}</label>
              <input type="checkbox" defaultChecked={idx < 3} />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label>{t("VAT Number")}</label>
            <input type="text" value="123-456-789" className="input" readOnly />
          </div>
          <div>
            <label>{t("Amount")}</label>
            <input type="number" value="0" className="input" readOnly />
          </div>
          <div>
            <label>{t("Method")}</label>
            <select className="input">
              <option>{t("Default Values")}</option>
            </select>
          </div>
          <div>
            <label>{t("Currency")}</label>
            <select className="input">
              <option>{t("US Dollar")}</option>
            </select>
          </div>
          <div>
            <label>{t("Separator")}</label>
            <select className="input">
              <option>{t(" (Comma & Dot)")}</option>
            </select>
          </div>
        </div>
      </section>
    </div>
  )
}

export default ProfileInvoiceSettings
