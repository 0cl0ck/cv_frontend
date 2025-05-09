import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// Initialiser Resend avec la clé API (à stocker dans les variables d'environnement)
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    // Récupérer les données du formulaire
    const { name, email, message } = await request.json();

    // Validation basique
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Veuillez remplir tous les champs' },
        { status: 400 }
      );
    }

    // Envoi de l'email
    const {  error } = await resend.emails.send({
      from: 'Formulaire Chanvre Vert <noreply@chanvre-vert.fr>',
      to: 'contact@chanvre-vert.fr',
      subject: `Nouveau message de ${name}`,
      replyTo: email,
      text: `Nom: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
      html: `
        <h3>Nouveau message du formulaire de contact</h3>
        <p><strong>Nom:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p style="white-space: pre-line;">${message}</p>
      `,
    });

    if (error) {
      console.error('Erreur Resend:', error);
      return NextResponse.json(
        { error: 'Erreur lors de l\'envoi de l\'email' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Email envoyé avec succès' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors du traitement de votre demande' },
      { status: 500 }
    );
  }
}
