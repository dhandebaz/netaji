
import { jsPDF } from "jspdf";
import { RTITask } from "../types";

export const generateRTIPDF = (task: RTITask, volunteerName: string, volunteerAddress: string, content?: string) => {
  const doc = new jsPDF();
  
  if (content) {
      // AI Generated Content Layout
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      
      const splitText = doc.splitTextToSize(content, 170);
      let y = 20;
      const lineHeight = 6;
      const pageHeight = doc.internal.pageSize.height;
      
      splitText.forEach((line: string) => {
          if (y > pageHeight - 20) {
              doc.addPage();
              y = 20;
          }
          // Check for header-like bold text (simple heuristic for lines ending in :)
          if (line.trim().endsWith(':') || line.includes("Subject:")) {
              doc.setFont("helvetica", "bold");
          } else {
              doc.setFont("helvetica", "normal");
          }
          
          doc.text(line, 20, y);
          y += lineHeight;
      });

      // Signature at the bottom if space allows, else new page
      if (y > pageHeight - 30) {
          doc.addPage();
          y = 20;
      }
      
      doc.setFont("helvetica", "italic");
      doc.text(`Generated via Neta Legal Aide on ${new Date().toLocaleDateString()}`, 20, y + 10);

  } else {
      // Legacy Static Layout
      doc.setFontSize(12);
      doc.text("To,", 20, 20);
      doc.text(`Public Information Officer (PIO)`, 20, 28);
      doc.text(`${task.pioDetails?.name || 'The PIO'}`, 20, 36);
      doc.text(`${task.pioDetails?.address || 'Office Address'}`, 20, 44);

      // Subject
      doc.setFont("helvetica", "bold");
      doc.text(`Subject: Application for Information under Section 6(1) of the RTI Act, 2005`, 20, 60);
      
      // Body
      doc.setFont("helvetica", "normal");
      doc.text("Dear Sir/Madam,", 20, 75);

      const bodyText = `I am a citizen of India and I request you to kindly provide the following information regarding ${task.politicianName}:`;
      const splitBody = doc.splitTextToSize(bodyText, 170);
      doc.text(splitBody, 20, 85);

      // Query
      doc.setFont("helvetica", "bold");
      doc.text(`Query: ${task.topic}`, 20, 100);
      doc.setFont("helvetica", "normal");
      doc.text("Please provide certified copies of the documents where applicable.", 20, 110);

      // Footer
      const declaration = "I state that the information sought does not fall within the restrictions contained in Section 8 and 9 of the Act and to the best of my knowledge it pertains to your office.";
      const splitDecl = doc.splitTextToSize(declaration, 170);
      doc.text(splitDecl, 20, 125);

      doc.text("I am willing to pay the fees for the information provided.", 20, 145);

      doc.text("Yours faithfully,", 140, 170);
      doc.text(`Name: ${volunteerName}`, 20, 180);
      doc.text(`Address: ${volunteerAddress}`, 20, 188);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 196);
  }

  // Save
  doc.save(`RTI_${task.politicianName.replace(/\s+/g, '_')}_${Date.now()}.pdf`);
};
