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
        <Preview>Reset your password for MiteinanderMatt</Preview>
        <Body style={main}>
          <Container style={container}>
            <Heading style={h1}>Reset Password</Heading>
            <Text style={text}>
              Click the button below to reset your password. This link will expire in 1 hour.
            </Text>
            <Link href={resetUrl} style={button}>
              Reset Password
            </Link>
            <Text style={text}>
              If you did not request this email you can safely ignore it.
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