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
} from "@react-email/components";
import * as React from "react";

interface MochiLetterProps {
  previewText?: string;
  authorName?: string;
}

export const MochiLetter = ({
  previewText = "きだからの、未完成な思考の手紙。",
  authorName = "きだ",
}: MochiLetterProps) => (
  <Html>
    <Head />
    <Preview>{previewText}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Heading style={h1}>もちスラ Lab</Heading>
          <Text style={subtitle}>Connecting the Pulse. Visualizing the Process.</Text>
        </Section>
        <Hr style={hr} />
        <Section style={content}>
          <Text style={text}>
            こんにちは、{authorName}です。
          </Text>
          <Text style={text}>
            この手紙を受け取っていただき、ありがとうございます。
            ここは、noteやブログのような「完成品」を置く場所ではありません。
          </Text>
          <Text style={text}>
            臨床の現場で感じた、まだ言葉にならない違和感や、
            研究室（Lab）の中で火花を散らしている最新の思考の欠片を、
            加工せずにそのままお届けします。
          </Text>
          <Text style={text}>
            あなたの臨床という旅に、静かな確信を添える一通になれば幸いです。
          </Text>
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
              Labを覗く
            </Link>
            {" | "}
            <Link href="https://note.com/mochisuranote" style={link}>
              note
            </Link>
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

export default MochiLetter;

const main = {
  backgroundColor: "#0a1628",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "40px 20px",
  backgroundColor: "#ffffff",
  borderRadius: "8px",
  maxWidth: "600px",
};

const header = {
  textAlign: "center" as const,
};

const h1 = {
  color: "#0a1628",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "30px 0",
  padding: "0",
};

const subtitle = {
  color: "#64748b",
  fontSize: "12px",
  textTransform: "uppercase" as const,
  letterSpacing: "0.1em",
};

const content = {
  padding: "20px 0",
};

const text = {
  color: "#334155",
  fontSize: "16px",
  lineHeight: "26px",
  textAlign: "left" as const,
};

const hr = {
  borderColor: "#e2e8f0",
  margin: "20px 0",
};

const footer = {
  textAlign: "center" as const,
};

const footerText = {
  color: "#64748b",
  fontSize: "14px",
  lineHeight: "24px",
};

const footerLink = {
  fontSize: "12px",
  marginTop: "10px",
};

const link = {
  color: "#00d2ff",
  textDecoration: "underline",
};
