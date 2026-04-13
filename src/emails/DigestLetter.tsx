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

interface DigestLetterProps {
  previewText: string;
  title: string;
  bodyContent: string;
  nerveContent: string;
  storyContent: string;
  noteLink: string;
  authorName?: string;
}

export const DigestLetter = ({
  previewText,
  title,
  bodyContent,
  nerveContent,
  storyContent,
  noteLink,
  authorName = "きだ",
}: DigestLetterProps) => (
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
          <Text style={subtitle}>M.O.C.H.I. LABO — Digest Letter</Text>
          <Heading style={h2}>{title}</Heading>
        </Section>
        <Hr style={hr} />
        
        <Section style={content}>
          <Heading style={h3}>【Body】今週の臨床風景</Heading>
          <Text style={text}>{bodyContent}</Text>
          
          <Hr style={hr} />
          
          <Heading style={h3}>【Nerve】知性の調律</Heading>
          <Text style={text}>{nerveContent}</Text>
          
          <Hr style={hr} />
          
          <Heading style={h3}>【Story】未来への一歩</Heading>
          <Text style={text}>{storyContent}</Text>
        </Section>

        <Hr style={hr} />
        
        <Section style={ctaSection}>
          <Text style={text}>
            この記事の全文と、さらに深い洞察はnoteで公開しています。
          </Text>
          <Link href={noteLink} style={button}>
            note本編を読む
          </Link>
        </Section>

        <Section style={footer}>
          <Text style={footerText}>
            {authorName} 記
            <br />
            M.O.C.H.I. LABO | 安全基地としての臨床
          </Text>
          <Text style={footerLink}>
            <Link href="https://lab.mochisura-lab.com" style={link}>
              Labを覗く
            </Link>
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

export default DigestLetter;

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

const h2 = {
  color: "#0a1628",
  fontSize: "20px",
  fontWeight: "bold",
  margin: "20px 0",
};

const h3 = {
  color: "#334155",
  fontSize: "16px",
  fontWeight: "bold",
  margin: "15px 0 5px",
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

const text = {
  color: "#334155",
  fontSize: "15px",
  lineHeight: "24px",
  textAlign: "left" as const,
  whiteSpace: "pre-wrap" as const,
};

const hr = {
  borderColor: "#f1f5f9",
  margin: "20px 0",
};

const ctaSection = {
  textAlign: "center" as const,
  padding: "20px 0",
};

const button = {
  backgroundColor: "#00d2ff",
  borderRadius: "4px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 24px",
  marginTop: "10px",
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
  color: "#64748b",
  textDecoration: "underline",
};

const avatar = {
  display: "block",
  margin: "0 auto",
  borderRadius: "50%",
};
