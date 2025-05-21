
# ✅ Plan de test E2E – Parcours Employé

## 🧑‍💼 Contexte :
L’employé se connecte à la plateforme Billed afin de soumettre une note de frais et de consulter ses justificatifs.

---

## 🔁 Étapes du parcours testées :

### 🔹 1. Connexion employé
- **Étape** : Aller sur `/login`
- **Action** : Renseigner email `employee@test.com` et mot de passe `employee123`, puis cliquer sur le bouton de connexion
- **Résultat attendu** : Redirection vers la page `/employee/bills`

### 🔹 2. Affichage des notes de frais
- **Étape** : Être sur `/employee/bills`
- **Action** : Consulter la liste des notes de frais
- **Résultat attendu** :
  - Les notes sont **triées par date décroissante**
  - Le bouton "Nouvelle note de frais" est visible

### 🔹 3. Consultation d’un justificatif
- **Étape** : Être sur `/employee/bills`
- **Action** : Cliquer sur l’icône 👁 d’un ticket
- **Résultat attendu** : Une **modale s’ouvre** affichant le justificatif (image)

### 🔹 4. Création d’une note de frais
- **Étape** : Cliquer sur "Nouvelle note de frais"
- **Action** : Remplir tous les champs obligatoires :
  - Type : "Transports"
  - Nom : "Taxi Paris"
  - Date : "2023-11-01"
  - Montant : "35"
  - TVA : "20"
  - Fichier joint : `justificatif.png` (image)
- **Résultat attendu** : Le bouton "Envoyer" est cliquable

### 🔹 5. Téléversement de justificatif invalide
- **Étape** : Sur le formulaire `/employee/bill/new`
- **Action** : Tenter d'uploader un fichier `.pdf`
- **Résultat attendu** : 
  - Une **alerte** s'affiche : "Seuls les fichiers .jpg, .jpeg ou .png sont autorisés."
  - Le champ fichier est **vidé**

### 🔹 6. Soumission du formulaire
- **Étape** : Après avoir rempli tous les champs
- **Action** : Cliquer sur "Envoyer"
- **Résultat attendu** :
  - Retour à la page `/employee/bills`
  - La nouvelle note de frais apparaît dans la liste

### 🔹 7. Déconnexion
- **Étape** : Depuis la page employé
- **Action** : Cliquer sur l’icône de déconnexion
- **Résultat attendu** : Retour à la page `/login` et `localStorage` vidé

---

## ✅ Remarques supplémentaires
- Chaque interaction devrait se faire **via interface utilisateur**, comme dans une situation réelle.
- Le plan peut être automatisé plus tard avec un outil comme **Cypress** ou **Playwright**.
