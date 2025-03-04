import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Link,
    Preview,
    Text,
  } from "@react-email/components"
  
  interface ResetPasswordEmailProps {
    resetUrl: string
  }
  
  export function ResetPasswordEmail({ resetUrl }: ResetPasswordEmailProps) {
    return (
      <Html>
        <Head />
        <Preview>Setzte dein Passwort für MiteinanderMatt zurück</Preview>
        <Body style={main}>
          <Container style={container}>
            <Heading style={h1}>Passwort ändern</Heading>
            <Text style={text}>
              Mit dem folgenden Link kannst du dein Passwort zurücksetzen, klicke einfach auf den Button.
            </Text>
            <Link href={resetUrl} style={button}>
              Passwort zurücksetzen
            </Link>
            <Text style={text}>
              Wenn du dein Passwort nicht zurücksetzen möchtest kannst du diese EMail ignorieren.
            </Text>
          </Container>
        </Body>
      </Html>
    )
  }
  
  const main = {
    backgroundColor: "#ffffff",
    fontFamily:
      '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
  }
  
  const container = {
    margin: "0 auto",
    padding: "20px 0 48px",
    width: "560px",
  }
  
  const h1 = {
    color: "#1a1a1a",
    fontSize: "24px",
    fontWeight: "normal",
    margin: "30px 0",
    padding: "0",
  }
  
  const text = {
    color: "#4c4c4c",
    fontSize: "16px",
    lineHeight: "24px",
    margin: "24px 0",
  }
  
  const button = {
    backgroundColor: "#000000",
    borderRadius: "4px",
    color: "#ffffff",
    display: "inline-block",
    fontSize: "16px",
    fontWeight: "bold",
    lineHeight: "50px",
    textAlign: "center" as const,
    textDecoration: "none",
    width: "200px",
  }