const PDFDocument = require("pdfkit");

const CLAUSES = [
  "I fully recognize and understand that there are risks and hazards, minor and serious, associated with participation in sport club events, ranging from scrapes, bruises, lacerations, broken bones to concussions, spinal cord injuries, paralysis and, even, death. These injuries may result from crashing with other participants, being hit by equipment, or environmental conditions.",
  "Knowing the dangers, hazards and risks associated with Wushu, I voluntarily assume all responsibility and risk of loss, damage, illness and/or injury to my person or property in any way associated with my participation in such activities.",
  "I understand that protective equipment including, but not limited to, shin, knee, and forearm pads, head gear and gloves is recommended for the safety and protection of participants in Wushu, and I agree to wear such equipment when participating in such activity that warrants this protective equipment. However, I understand that wearing such equipment will not eliminate the risks of participation.",
  "I understand that the rules and regulations applicable to the Terp Wushu Club and the International Wushu Federation Society are designed, in part, for the safety and protection of participants and I agree to abide by those rules and regulations.",
  "I understand that Wushu requires a minimum level of fitness for safe participation. I also understand that Campus Recreation Services advises that participants in sport club activities have a physical examination to determine their fitness for participation, and I represent that there are no physical or other health related reasons which would render my participation in sport club activities dangerous or otherwise harmful to the health or physical well-being of myself or others. I further understand that the University of Maryland does not provide medical, health or other insurance for participants in sport club activities.",
  "To the fullest extent permitted by law, I hereby release and forever discharge, and agree to indemnify and hold harmless, the State of Maryland, the University of Maryland, Campus Recreation Services and their officers, agents and employees from and against any and all liabilities, claims, demands and causes of action on account of any loss or injury in any way arising out of or relating to my participation in or involvement with sport club activities, or use of CRS equipment and facilities including travel thereto and therefrom, whether due to the negligence, omission, default or other action of any person or entity.",
];

// Generates a PDF record of the digital consent a registrant gave during registration
function generateWaiverPdf({ firstName, lastName, eventNumber, uwgDay, isMinor, acceptedAt }) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 54 });
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const title = `${eventNumber ? eventNumber + " " : ""}Annual Wushu Games Waiver`;
    doc.fontSize(16).font("Helvetica-Bold").text(title, { align: "center" });
    doc.moveDown(1.5);

    doc.fontSize(11).font("Helvetica");
    doc.text(
      `I, ${firstName} ${lastName}, desire to participate in the ${eventNumber || ""} Annual University Wushu Games` +
        (uwgDay ? ` on ${uwgDay}.` : ".") +
        " In consideration of being permitted to participate in such sport club activities, I, for myself, my heirs, personal representative(s) and assigns hereby represent and agree as follows:",
      { align: "justify" }
    );
    doc.moveDown();

    CLAUSES.forEach((clause, i) => {
      doc.text(`${i + 1}. ${clause}`, { align: "justify" });
      doc.moveDown(0.5);
    });

    doc.moveDown(0.5);
    doc.font("Helvetica-Bold").text("YES! ", { continued: true });
    doc.font("Helvetica").text(
      isMinor
        ? "I ACKNOWLEDGE THAT IF I AM UNDER 18 YEARS OF AGE, I MUST FILL OUT A WAIVER AND OBTAIN THE SIGNATURE OF MY PARENT/LEGAL GUARDIAN. OTHERWISE I AGREE TO FORFEIT MY POSITION IN THE COMPETITION."
        : "I CERTIFY THAT I AM 18 YEARS OF AGE OR OLDER AND THAT I HAVE READ AND FULLY UNDERSTAND THIS RELEASE AND INFORMED CONSENT FORM AND I SIGN IT VOLUNTARILY WITH FULL KNOWLEDGE OF ITS SIGNIFICANCE.",
      { align: "justify" }
    );

    doc.moveDown(2);
    doc.font("Helvetica-Bold").text(`Electronically signed by: ${firstName} ${lastName}`);
    doc.font("Helvetica").text(
      `Date/Time: ${new Date(acceptedAt).toLocaleString("en-US", { dateStyle: "long", timeStyle: "short", timeZone: "America/New_York" })} ET`
    );

    if (isMinor) {
      doc.moveDown();
      doc.fillColor("#9B1C1C").font("Helvetica-Bold").text(
        "Note: A signed Parental/Guardian Consent Form must also be submitted for this competitor."
      );
      doc.fillColor("black").font("Helvetica");
    }

    doc.end();
  });
}

module.exports = { generateWaiverPdf };
