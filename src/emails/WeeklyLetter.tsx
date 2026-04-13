import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Hr,
  Link,
  Img,
} from "@react-email/components";
import * as React from "react";

interface WeeklyLetterProps {
  previewText?: string;
  title: string;
  htmlContent: string;
}

export const WeeklyLetter = ({
  previewText = "きだからの週刊メルマガ。",
  title,
  htmlContent,
}: WeeklyLetterProps) => (
  <Html>
    <Head />
    <Preview>{previewText}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Img
            src="https://lab.mochisura-lab.com/images/mochisura_avatar.png"
            width="60"
            height="60"
            alt="Mochi-Sura"
            style={avatar}
          />
          <Text style={subtitle}>M.O.C.H.I. LABO — Weekly Broadcast</Text>
          <Heading style={h2}>{title}</Heading>
        </Section>
        <Hr style={hr} />
        
        <Section style={content}>
          <div 
            style={htmlContentStyle}
            dangerouslySetInnerHTML={{ __html: htmlContent }} 
          />
        </Section>

        <Hr style={hr} />
        
        <Section style={footer}>
          <Text style={footerText}>
            きだ 記
            <br />
            M.O.C.H.I. LABO | 安全基地としての臨床
          </Text>
          <Text style={footerLink}>
            <Link href="https://lab.mochisura-lab.com" style={link}>
              Labログイン / 研究室を覗く
            </Link>
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

export default WeeklyLetter;

const main = {
  backgroundColor: "#f8fafc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "40px 20px",
  backgroundColor: "#ffffff",
  borderRadius: "8px",
  maxWidth: "600px",
  border: "1px solid #e2e8f0",
};

const header = {
  textAlign: "center" as const,
};

const h2 = {
  color: "#0f172a",
  fontSize: "22px",
  fontWeight: "bold",
  margin: "20px 0",
  lineHeight: "1.4",
};

const subtitle = {
  color: "#64748b",
  fontSize: "10px",
  textTransform: "uppercase" as const,
  letterSpacing: "0.1em",
  marginTop: "10px",
};

const content = {
  padding: "10px 0",
};

const htmlContentStyle = {
  color: "#334155",
  fontSize: "15px",
  lineHeight: "1.7",
  textAlign: "left" as const,
};

const hr = {
  borderColor: "#f1f5f9",
  margin: "30px 0",
};

const footer = {
  textAlign: "center" as const,
  marginTop: "20px",
};

const footerText = {
  color: "#64748b",
  fontSize: "13px",
  lineHeight: "20px",
};

const footerLink = {
  fontSize: "12px",
  marginTop: "10px",
};

const link = {
  color: "#00d2ff",
  textDecoration: "underline",
};

const avatar = {
  display: "block",
  margin: "0 auto",
  borderRadius: "50%",
};
