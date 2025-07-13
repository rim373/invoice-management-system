import React from "react";

const ProfileInvoiceSettings = () => {
  return (
    <div className="p-6 space-y-6">
      {/* Profil Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-4 rounded-2xl shadow">
        <div className="space-y-2">
          <label className="font-semibold">Logo</label>
          <div className="border border-dashed rounded-xl flex items-center justify-center h-48">
            <span>Drag file here</span>
          </div>
          <button className="bg-blue-500 text-white rounded-xl px-4 py-2 mt-2">OR SELECT PHOTO</button>
        </div>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label>Nom et Prénom</label>
            <input type="text" value="Manta Ray" className="input" readOnly />
          </div>
          <div>
            <label>Adresse</label>
            <input type="text" value="Incubateur Supcom Technopole Ghazela Ariana Tunis" className="input" readOnly />
          </div>
          <div>
            <label>N° de téléphone</label>
            <input type="text" value="+216 54131778" className="input" readOnly />
          </div>
          <div>
            <label>Fields.bankrib</label>
            <input type="text" className="input" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label>Société</label>
            <input type="text" value="Omnilink" className="input" readOnly />
          </div>
          <div>
            <label>Email</label>
            <input type="text" value="omnilink.tn@gmail.com" className="input" readOnly />
          </div>
          <div>
            <label>Site internet</label>
            <input type="text" value="http://www.Omnilink.tn/" className="input" readOnly />
          </div>
          <div>
            <label>Fields.bankname</label>
            <input type="text" className="input" />
          </div>
        </div>
      </section>

      {/* Général Section */}
      <section className="bg-white p-4 rounded-2xl shadow space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label>Son</label>
            <select className="input">
              <option>Valeurs par défaut</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label>Muet</label>
            <input type="checkbox" />
          </div>
          <div>
            <label>Langue</label>
            <select className="input">
              <option>Français</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label>Ouvrir le fichier PDF après la sauvegarde</label>
            <input type="checkbox" checked />
          </div>
        </div>
        <div>
          <label>Emplacement de sauvegarde du dossier PDF</label>
          <input type="text" value="C:\\Users\\rimba" className="input" readOnly />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label>Modèle</label>
            <select className="input">
              <option>Minimal</option>
            </select>
          </div>
          <div>
            <label>Format de la date</label>
            <select className="input">
              <option>07/02/2025 (MM/DD/YYYY)</option>
            </select>
          </div>
        </div>
      </section>

      {/* Facture Section */}
      <section className="bg-white p-4 rounded-2xl shadow space-y-4">
        <div className="flex flex-wrap gap-4">
          {['Numero de la facture', 'Échéance', 'Devise', 'Remise', 'Taxe', 'Remarque'].map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <label>{item}</label>
              <input type="checkbox" defaultChecked={idx < 3} />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label>Numéro de TVA</label>
            <input type="text" value="123-456-789" className="input" readOnly />
          </div>
          <div>
            <label>Montant</label>
            <input type="number" value="0" className="input" readOnly />
          </div>
          <div>
            <label>Méthode</label>
            <select className="input">
              <option>Valeurs par défaut</option>
            </select>
          </div>
          <div>
            <label>Devise</label>
            <select className="input">
              <option>US Dollar</option>
            </select>
          </div>
          <div>
            <label>Séparateur</label>
            <select className="input">
              <option>1,999.000 (Comma & Dot)</option>
            </select>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProfileInvoiceSettings;
