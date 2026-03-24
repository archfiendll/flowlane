from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import tempfile
import shutil
import re


ROOT = Path(__file__).resolve().parents[1]
TEMPLATES_DIR = ROOT / "templates" / "documents"


COMMON_REPLACEMENTS = [
    ("POKE BOWLS HOUSE SRL", "{{COMPANY NAME}}"),
    ("POKE BOWLS HOUSE S.R.L.", "{{COMPANY NAME}}"),
    ("POKE  BOWLS HOUSE SRL", "{{COMPANY NAME}}"),
    ("GIUROIU SOFIAN-ALEXANDRU", "{{COMPANY LEGAL REPRESENTATIVE NAME}}"),
    ("Cod fiscal 45409049", "Cod fiscal {{COMPANY CUI}}"),
    ("C.U.I. 45409049", "C.U.I. {{COMPANY CUI}}"),
    ("Registrul Comerțului J2021022662401", "Registrul Comerțului {{COMPANY TRADE REGISTER}}"),
    ("Registrul Comerțului J2021022662401", "Registrul Comerțului {{COMPANY TRADE REGISTER}}"),
    ("J2021022662401", "{{COMPANY TRADE REGISTER}}"),
    ("45409049", "{{COMPANY CUI}}"),
    ("Reprezentant legal,{{COMPANY LEGAL REPRESENTATIVE NAME}}", "Reprezentant legal, {{COMPANY LEGAL REPRESENTATIVE NAME}}"),
    ("SECTOR 2, CALEA MOȘILOR, NR.  158, ARIPA STÂNGĂ, CAMERA 4, ETAJ 4, Mun. BUCUREȘTI", "{{COMPANY FULL ADDRESS}}"),
    ("SECTOR 2, CALEA MOSILOR, NR. 158, ARIPA STANGA, CAMERA 4, ETAJ  4, BUCUREȘTI", "{{COMPANY FULL ADDRESS}}"),
    ("BUCUREȘTI, CALEA MOSILOR, NR. 158, ARIPA STANGA, CAMERA 4, ETAJ 4,  SECTOR 2", "{{COMPANY FULL ADDRESS}}"),
]


FILE_REPLACEMENTS = {
    "cim-template.docx": [
        ("Angajator {{COMPANY NAME}}", "Angajator {{COMPANY NAME}}"),
        ("Adresa SECTOR 2, CALEA MOSILOR, NR. 158, ARIPA STANGA, CAMERA 4, ETAJ  4, BUCURESTI", "Adresa {{COMPANY FULL ADDRESS}}"),
        ("Angajator - persoană juridică, {{COMPANY NAME}} cu sediul în SECTOR 2, CALEA MOȘILOR, NR.  158, ARIPA STÂNGĂ, CAMERA 4, ETAJ 4, Mun. BUCUREȘTI, înregistrată în Registrul Comerțului, sub  numărul {{COMPANY TRADE REGISTER}}, cod fiscal {{COMPANY CUI}}, reprezentată legal prin {{COMPANY LEGAL REPRESENTATIVE NAME}} în calitate de Administrator,", "Angajator - persoană juridică, {{COMPANY NAME}} cu sediul în {{COMPANY FULL ADDRESS}}, înregistrată în Registrul Comerțului, sub numărul {{COMPANY TRADE REGISTER}}, cod fiscal {{COMPANY CUI}}, reprezentată legal prin {{COMPANY LEGAL REPRESENTATIVE NAME}} în calitate de {{COMPANY LEGAL REPRESENTATIVE TITLE}},"),
        ("B. Obiectul contractului: constă în obligația asumată de salariat de a presta munca pentru și sub  autoritatea Angajatorului {{COMPANY NAME}} în schimbul unui salariu plătit de acesta, în  condițiile prevăzute în prezentul contract.", "B. Obiectul contractului: constă în obligația asumată de salariat de a presta munca pentru și sub autoritatea Angajatorului {{COMPANY NAME}} în schimbul unui salariu plătit de acesta, în condițiile prevăzute în prezentul contract."),
    ],
    "job-description-assistant-manager-template.docx": [
        ("Adresa SECTOR 2, CALEA MOSILOR, NR. 158, ARIPA STANGA, CAMERA 4, ETAJ  4, BUCURESTI", "Adresa {{COMPANY FULL ADDRESS}}"),
    ],
    "information-minute-template.docx": [
        ("Adresa SECTOR 2, CALEA MOSILOR, NR. 158, ARIPA STANGA, CAMERA 4, ETAJ  4, BUCUREȘTI", "Adresa {{COMPANY FULL ADDRESS}}"),
        ("Angajator {{COMPANY NAME}}, Cod fiscal {{COMPANY CUI}}.", "Angajator {{COMPANY NAME}}, Cod fiscal {{COMPANY CUI}}."),
        ("3. Sediul angajatorului: BUCUREȘTI, CALEA MOSILOR, NR. 158, ARIPA STANGA, CAMERA 4, ETAJ 4,  SECTOR 2", "3. Sediul angajatorului: {{COMPANY FULL ADDRESS}}"),
        ("Angajator,\n{{COMPANY NAME}}", "Angajator,\n{{COMPANY NAME}}"),
        ("Reprezentant legal,{{COMPANY LEGAL REPRESENTATIVE NAME}}", "Reprezentant legal, {{COMPANY LEGAL REPRESENTATIVE NAME}}"),
    ],
    "gdpr-consent-template.docx": [
        ("în calitate de  persoană care dorește să se angajeze în cadrul entitatii {{COMPANY NAME}}, precum și în calitate de  persoană vizată a prelucrării datelor cu caracter personal, consimt, în mod expres și voluntar, ca {{COMPANY NAME}}, persoană juridică română, cu sediul social în SECTOR 2, CALEA MOSILOR, NR.  158, ARIPA STANGA, CAMERA 4, ETAJ 4, BUCUREȘTI, email administration.ro@pokehouse.it, să colecteze și să prelucreze, în temeiul art. 6 alin. (1), lit. a) din Regulamentul  (UE) 2016/679, datele mele cu caracter personal (nume, număr de identificare, adresă, date de  localizare, alte date de identificare, adresă de email, număr de telefon etc.) informații comunicate în  scopul analizării încheierii contractului de muncă dintre mine și societate.", "în calitate de persoană care dorește să se angajeze în cadrul entității {{COMPANY NAME}}, precum și în calitate de persoană vizată a prelucrării datelor cu caracter personal, consimt, în mod expres și voluntar, ca {{COMPANY NAME}}, persoană juridică română, cu sediul social în {{COMPANY FULL ADDRESS}}, să colecteze și să prelucreze, în temeiul art. 6 alin. (1), lit. a) din Regulamentul (UE) 2016/679, datele mele cu caracter personal (nume, număr de identificare, adresă, date de localizare, alte date de identificare, adresă de email, număr de telefon etc.) informații comunicate în scopul analizării încheierii contractului de muncă dintre mine și societate."),
        ("ca {{COMPANY NAME}}, persoană juridică română, cu sediul social în {{COMPANY FULL ADDRESS}}, email administration.ro@pokehouse.it,", "ca {{COMPANY NAME}}, persoană juridică română, cu sediul social în {{COMPANY FULL ADDRESS}}, email {{COMPANY EMAIL}},"),
        ("Menționez că sunt de acord în mod expres ca destinatarii datelor mele cu caracter personal  să fie angajații societății, departamentul de contabilitate, autoritățile statului, precum și că sunt de acord cu stocarea acestor date în arhiva {{COMPANY NAME}}.", "Menționez că sunt de acord în mod expres ca destinatarii datelor mele cu caracter personal să fie angajații societății, departamentul de contabilitate, autoritățile statului, precum și că sunt de acord cu stocarea acestor date în arhiva {{COMPANY NAME}}."),
    ],
}


REGEX_REPLACEMENTS = {
    "cim-template.docx": [
        (
            re.compile(r"SECTOR 2, CALEA MOȘILOR, NR\.\s+158, ARIPA STÂNGĂ, CAMERA 4, ETAJ 4, Mun\. BUCUREȘTI"),
            "{{COMPANY FULL ADDRESS}}",
        ),
        (
            re.compile(r"GIUROIU </w:t></w:r><w:r[^>]*>.*?<w:t[^>]*>SOFIAN-ALEXANDRU", re.DOTALL),
            "{{COMPANY LEGAL REPRESENTATIVE NAME}}",
        ),
        (
            re.compile(r"în calitate de Administrator,"),
            "în calitate de {{COMPANY LEGAL REPRESENTATIVE TITLE}},",
        ),
    ],
    "information-minute-template.docx": [
        (
            re.compile(r"Adresa SECTOR 2, CALEA MOSILOR, NR\. 158, ARIPA STANGA, CAMERA 4, ETAJ\s+4, </w:t></w:r><w:r[^>]*>.*?<w:t[^>]*>BUCUREȘTI", re.DOTALL),
            "Adresa {{COMPANY FULL ADDRESS}}",
        ),
        (
            re.compile(r"3\. Sediul angajatorului: BUCUREȘTI, CALEA MOSILOR, NR\. 158, ARIPA STANGA, CAMERA 4, ETAJ 4,\s+SECTOR 2"),
            "3. Sediul angajatorului: {{COMPANY FULL ADDRESS}}",
        ),
        (
            re.compile(r"Reprezentant legal,{{COMPANY LEGAL REPRESENTATIVE NAME}}"),
            "Reprezentant legal, {{COMPANY LEGAL REPRESENTATIVE NAME}}",
        ),
    ],
    "gdpr-consent-template.docx": [
        (
            re.compile(r"SECTOR 2, CALEA MOSILOR, NR\.\s+158, ARIPA STANGA, CAMERA 4, ETAJ 4, </w:t></w:r><w:r[^>]*>.*?<w:t[^>]*>BUCUREȘTI", re.DOTALL),
            "{{COMPANY FULL ADDRESS}}",
        ),
        (
            re.compile(r"administration\.ro@pokehouse\.it"),
            "{{COMPANY EMAIL}}",
        ),
    ],
}


def retag_docx(docx_path: Path) -> None:
    with tempfile.TemporaryDirectory() as tmp_dir:
        tmp_path = Path(tmp_dir) / docx_path.name
        shutil.copy2(docx_path, tmp_path)

        with ZipFile(tmp_path, "r") as zin:
            xml = zin.read("word/document.xml").decode("utf-8")
            for old, new in COMMON_REPLACEMENTS:
                xml = xml.replace(old, new)
            for old, new in FILE_REPLACEMENTS.get(docx_path.name, []):
                xml = xml.replace(old, new)
            for pattern, replacement in REGEX_REPLACEMENTS.get(docx_path.name, []):
                xml = pattern.sub(replacement, xml)

            rewritten = Path(tmp_dir) / "rewritten.docx"
            with ZipFile(rewritten, "w", ZIP_DEFLATED) as zout:
                for item in zin.infolist():
                    data = zin.read(item.filename)
                    if item.filename == "word/document.xml":
                        data = xml.encode("utf-8")
                    zout.writestr(item, data)

        shutil.move(rewritten, docx_path)


def main() -> None:
    for docx_path in sorted(TEMPLATES_DIR.glob("*.docx")):
        retag_docx(docx_path)
        print(f"Updated {docx_path.name}")


if __name__ == "__main__":
    main()
