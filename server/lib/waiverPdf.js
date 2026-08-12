const PDFDocument = require("pdfkit");

const ADULT_CLAUSES = [
  "I fully recognize and understand that there are risks and hazards, minor and serious, associated with participation in sport club events, ranging from scrapes, bruises, lacerations, broken bones to concussions, spinal cord injuries, paralysis and, even, death. These injuries may result from crashing with other participants, being hit by equipment, or environmental conditions.",
  "I understand that protective equipment, including but not limited to, headgear, pads, eyewear and mouthpieces may be recommended for the safety and protection of participants, and I agree to wear such equipment when participating in such activities. However, I understand that wearing such equipment will not eliminate the risks of participation.",
  "I understand that the rules and regulations of the national entity or governing body that sponsors my sport club are designed, in part, for the safety and protection of participants and I agree to abide by those rules and regulations.",
  "I understand that sports require a minimum level of fitness for safe participation. I also understand that University Recreation & Wellness advises that participants in sport club activities have a physical examination to determine their fitness for participation and to carry personal health and accident insurance. I further understand that the University of Maryland does not provide medical, health or other insurance for participants in sport club activities.",
  "In the event of a medical emergency, I hereby give my consent to emergency transportation and medical treatment arising out of or related to participation in the Event.",
  "Knowing the dangers, hazards and risks associated with sport club activities, I voluntarily assume all responsibility and risk of loss, damage, illness and/or injury to my person or property in any way associated with my participation in the Event, including related travel.",
  "To the fullest extent permitted by law, I hereby release and forever discharge, and agree to indemnify and hold harmless the State of Maryland, the University of Maryland, and their departments, officers, agents, employees, and volunteers (Released Parties) from and against any and all liabilities, claims, demands, causes of action, costs and expenses, (including attorneys' fees and related litigation costs) incurred by any of the Released Parties arising out of or relating to my participation in or involvement with the Event, or use of RecWell equipment and facilities, including travel thereto and therefrom, whether due to the negligence, default or other action or inaction of any person or entity, including the Released Parties.",
];

const PARENTAL_CLAUSES = [
  "I understand that the University is not the sponsor of the Event, which is organized by the University of Maryland Wushu Club, an independent student organization. The University is not responsible for the Event, and it does not oversee, supervise or control Event activities.",
  "I fully recognize and understand that there are risks and hazards, minor and serious, associated with participation in wushu, which include, but are not limited to: muscular strains, bruises, broken bones, dislocations, lacerations, concussions, head and eye injuries caused by approved equipment, paralysis; and which may also include other serious bodily injuries and, even, death.",
  "Knowing the dangers, hazards and risks associated with wushu, I voluntarily assume all responsibility and risk of loss, damage, illness and/or injury to person or property that my child may, in any way, sustain in connection with his/her participation in such activities at the Event.",
  "I understand that the rules and regulations applicable to wushu are designed, in part, for the safety and protection of participants and others, and I agree that my child must abide by those rules and regulations. I further understand that protective equipment is recommended for the safety and protection of participants in wushu, and I agree that my child must provide and wear such equipment when participating in such activities. However, I understand that such rules and regulations and wearing such equipment will not eliminate the risks of participation in wushu activities.",
  "I understand that wushu requires a minimum level of experience and fitness for safe participation. I, on behalf of my minor child, also understand that the University advises that participants in Club Sport related activities have a physical examination to determine their fitness for participation. I further understand that the University of Maryland does not provide medical, health or other insurance for participants in the Event or other Club Sport related activities.",
  "To the fullest extent permitted by law, I hereby release and forever discharge, and agree to indemnify and hold harmless, the State of Maryland, the University of Maryland, University Recreation & Wellness and their officers, agents, employees, students, and volunteers from and against any and all liabilities, claims, demands and causes of action on account of any loss or injury in any way arising out of or relating to my child's participation in or involvement with wushu activities during the Event, including the use of University equipment and facilities in connection therewith, whether due to the negligence, default or other action or inaction of any person or entity.",
];

function formatDateTime(acceptedAt) {
  return `${new Date(acceptedAt).toLocaleString("en-US", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "America/New_York",
  })} ET`;
}

function generateWaiverPdf({ firstName, lastName, eventDate, isMinor, parentGuardianName, acceptedAt, signatureImage }) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 54 });
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.font("Times-Roman").fontSize(12);
    doc.text("UNIVERSITY OF MARYLAND", { align: "center" });
    doc.text(
      isMinor ? "SPORT CLUBS PARENTAL RELEASE AND INFORMED CONSENT FORM" : "SPORT CLUBS RELEASE AND INFORMED CONSENT FORM",
      { align: "center" }
    );
    doc.font("Times-Bold").text("Event", { align: "center" });
    doc.moveDown();

    const name = `${firstName} ${lastName}`;
    const dateClause = eventDate ? ` on ${eventDate}` : "";

    if (isMinor) {
      doc.font("Times-Roman").text(
        `I, on behalf of my minor child, ${name}, desire for my minor child to participate in Wushu activities during the University Wushu Games (the "Event"), to be held at the University of Maryland ("the University")${dateClause}. In consideration of my child being permitted to participate in this activity, I, for and on behalf of my minor child and myself, our heirs, personal representative(s) and assigns, hereby represent and agree as follows:`,
        { align: "justify" }
      );
      doc.moveDown();

      PARENTAL_CLAUSES.forEach((clause, i) => {
        doc.text(`${i + 1}. ${clause}`, { align: "justify" });
        doc.moveDown(0.5);
      });

      doc.moveDown(0.5);
      doc.text(
        "I, THE PARENT/GUARDIAN CERTIFY THAT I AM 18 YEARS OF AGE OR OLDER AND THAT I HAVE READ AND FULLY UNDERSTAND THIS RELEASE AND INFORMED CONSENT FORM AND I SIGN IT VOLUNTARILY WITH FULL KNOWLEDGE OF ITS SIGNIFICANCE.",
        { align: "justify" }
      );

      doc.moveDown(2);
      if (signatureImage) {
        doc.image(signatureImage, { fit: [200, 80] });
        doc.moveDown(0.5);
      }
      doc.font("Times-Bold").text(`Parent/Guardian: ${parentGuardianName}`);
      doc.font("Times-Roman").text(`Date/Time: ${formatDateTime(acceptedAt)}`);
    } else {
      doc.font("Times-Roman").text(
        `I, ${name}, desire to participate in the University Wushu Games, hosted by Terp Wushu Club event${dateClause} at University of Maryland, College Park. In consideration of being permitted to participate in such sport club activities, I, for myself, my heirs, personal representative(s) and assigns hereby represent and agree as follows:`,
        { align: "justify" }
      );
      doc.moveDown();

      ADULT_CLAUSES.forEach((clause, i) => {
        doc.text(`${i + 1}. ${clause}`, { align: "justify" });
        doc.moveDown(0.5);
      });

      doc.moveDown(0.5);
      doc.font("Times-Bold").text("YES! ", { continued: true });
      doc.font("Times-Roman").text(
        "I CERTIFY THAT I AM 18 YEARS OF AGE OR OLDER AND THAT I HAVE READ AND FULLY UNDERSTAND THIS RELEASE AND INFORMED CONSENT FORM AND I SIGN IT VOLUNTARILY WITH FULL KNOWLEDGE OF ITS SIGNIFICANCE.",
        { align: "justify" }
      );

      doc.moveDown(2);
      if (signatureImage) {
        doc.image(signatureImage, { fit: [200, 80] });
        doc.moveDown(0.5);
      }
      doc.font("Times-Bold").text(`Electronically signed by: ${name}`);
      doc.font("Times-Roman").text(`Date/Time: ${formatDateTime(acceptedAt)}`);
    }

    doc.end();
  });
}

module.exports = { generateWaiverPdf };
