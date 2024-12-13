import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Link,
    Preview,
    Section,
    Text,
  } from "@react-email/components";
  import * as React from "react";
  
  interface ProjectInviteEmailProps {
    inviterName: string;
    projectName: string;
    projectId: string;
  }
  
  export const ProjectInviteEmail = ({
    inviterName,
    projectName,
    projectId,
  }: ProjectInviteEmailProps) => {
    const previewText = `You've been added to ${projectName} on Projectica`;
  
    return (
      <Html>
        <Head />
        <Preview>{previewText}</Preview>
        <Body style={main}>
          <Container style={container}>
            <Heading style={heading}>Welcome to {projectName}</Heading>
            <Section style={body}>
              <Text style={paragraph}>
                {inviterName} has added you to the project "{projectName}" on Projectica.
              </Text>
              <Text style={paragraph}>
                You can now access the project and start collaborating with the team.
              </Text>
              <Text style={paragraph}>
                <Link 
                  href={`${process.env.NEXT_PUBLIC_APP_URL}/project/${projectId}`}
                  style={button}
                >
                  View Project
                </Link>
              </Text>
            </Section>
            <Text style={footer}>
              Best regards,
              <br />
              The Projectica Team
            </Text>
          </Container>
        </Body>
      </Html>
    );
  };
  
  const main = {
    backgroundColor: "#1a1a1a",
    color: "#ffffff",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  };
  
  const container = {
    margin: "0 auto",
    padding: "40px 20px",
    maxWidth: "600px",
  };
  
  const heading = {
    fontSize: "24px",
    fontWeight: "bold",
    marginBottom: "24px",
    color: "#ffffff",
  };
  
  const body = {
    margin: "24px 0",
  };
  
  const paragraph = {
    fontSize: "16px",
    lineHeight: "24px",
    marginBottom: "20px",
    color: "#e0e0e0",
  };
  
  const button = {
    backgroundColor: "#3b82f6",
    color: "#ffffff",
    padding: "12px 24px",
    borderRadius: "6px",
    textDecoration: "none",
    display: "inline-block",
    marginTop: "16px",
  };
  
  const footer = {
    fontSize: "14px",
    color: "#888888",
    marginTop: "32px",
  };
  
  export default ProjectInviteEmail;
  