'use client';

import React from 'react';
import styled, { ThemeProvider, css } from 'styled-components';
import GlobalStyles from '@/styles/GlobalStyles';
import theme from '@/styles/theme';
import Link from 'next/link';
import { FaYoutube, FaCheckCircle, FaTimesCircle, FaCrown, FaThLarge, FaListUl, FaSave, FaSignInAlt, FaRocket, FaInfoCircle, FaColumns } from 'react-icons/fa';

// --- Base Styles & Theme ---

// (Keep existing theme import)

// --- Styled Components ---

const LandingPageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: ${() => theme.colors.background};
  color: ${() => theme.colors.text};
  overflow-x: hidden; // Prevent horizontal scroll
`;

const Navbar = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${() => theme.spacing.medium} ${() => theme.spacing.large};
  background-color: rgba(31, 41, 55, 0.8); // Slightly transparent bg
  border-bottom: 1px solid ${() => theme.colors.border};
  position: sticky; // Make navbar sticky
  top: 0;
  z-index: 1000;
  backdrop-filter: blur(10px); // Blur effect for modern look
`;

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${() => theme.spacing.small};
  color: ${() => theme.colors.white};
`;

const LogoIcon = styled(FaYoutube)`
  font-size: 2rem;
  color: #FF0000; // YouTube Red
`;

const LogoText = styled.h1`
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
`;

const NavLinks = styled.div`
  display: flex;
  gap: ${() => theme.spacing.small}; // Reduced gap slightly
`;

const NavLink = styled(Link)`
  color: ${() => theme.colors.text};
  text-decoration: none;
  font-weight: 500;
  padding: ${() => theme.spacing.small} ${() => theme.spacing.medium};
  border-radius: ${() => theme.borderRadius};
  transition: background-color 0.2s ease, color 0.2s ease;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
    color: ${() => theme.colors.white};
  }
`;

const CTAButton = styled(Link)<{ $primary?: boolean }>`
  background-color: ${({ $primary = true }) => $primary ? theme.colors.primary : 'transparent'};
  color: ${() => theme.colors.white};
  padding: calc(${() => theme.spacing.small} + 2px) calc(${() => theme.spacing.large}); // Slightly larger padding
  border-radius: ${() => theme.borderRadius};
  border: 1px solid ${({ $primary = true }) => $primary ? theme.colors.primary : theme.colors.border};
  text-decoration: none;
  font-weight: 600;
  transition: all 0.2s ease;
  display: inline-flex; // Align icon and text
  align-items: center;
  gap: ${() => theme.spacing.small};

  &:hover {
    background-color: ${({ $primary = true }) => $primary ? theme.colors.primaryHover : `rgba(255, 255, 255, 0.1)`};
    border-color: ${({ $primary = true }) => $primary ? theme.colors.primaryHover : theme.colors.primary};
    transform: translateY(-2px); // Subtle lift effect
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  }
`;

const NavbarCTA = styled(CTAButton)`
    padding: ${() => theme.spacing.small} ${() => theme.spacing.medium}; // Smaller padding for navbar button
`;

const MainContent = styled.main`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

// --- Hero Section ---

const HeroSection = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 100px ${() => theme.spacing.large} 80px; // Increased padding
  // More subtle gradient, less dark at the top
  background: linear-gradient(180deg, rgba(31, 41, 55, 0.9) 0%, ${() => theme.colors.background} 100%);
  width: 100%; // Ensure full width
`;

const HeroTitle = styled.h2`
  font-size: clamp(2.5rem, 6vw, 3.8rem); // Responsive font size
  font-weight: 700; // Bold
  margin-bottom: ${() => theme.spacing.medium};
  color: ${() => theme.colors.white};
  max-width: 900px; // Wider max-width
  line-height: 1.2;
  letter-spacing: -0.5px; // Tighter letter spacing
`;

const HeroSubtitle = styled.p`
  font-size: clamp(1rem, 2.5vw, 1.25rem); // Responsive font size
  color: ${() => theme.colors.text}; // Slightly brighter text?
  margin-bottom: ${() => theme.spacing.large};
  max-width: 700px; // Wider max-width
  line-height: 1.7; // Increased line height
`;

const HeroCTAWrapper = styled.div`
    margin-top: ${() => theme.spacing.medium};
    display: flex;
    gap: ${() => theme.spacing.medium};
    align-items: center;
`;

const HeroImage = styled.img`
  width: 100%;
  max-width: 800px; // Increased max-width
  margin-top: 60px; // Increased margin-top
  border-radius: 12px; // Slightly larger radius
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3); // Enhanced shadow
  border: 1px solid ${() => theme.colors.border}; // Subtle border
`;

// --- Features Section ---

const FeaturesSection = styled.section`
  padding: 80px ${() => theme.spacing.large}; // Increased padding
  width: 100%;
  max-width: 1200px;
  text-align: center;
`;

const SectionTitle = styled.h3`
  font-size: clamp(1.8rem, 5vw, 2.5rem); // Responsive font size
  font-weight: 600;
  margin-bottom: 50px; // Increased margin
  color: ${() => theme.colors.white};
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); // Slightly larger min width
  gap: ${() => theme.spacing.large};
`;

const FeatureCard = styled.div`
  background-color: #1F2937;
  padding: calc(${() => theme.spacing.large} + 5px); // Slightly more padding
  border-radius: 8px; // Rounded corners
  border: 1px solid ${() => theme.colors.border};
  text-align: left;
  transition: transform 0.3s ease, box-shadow 0.3s ease; // Smooth transition
  display: flex; // Use flexbox for icon alignment
  flex-direction: column; // Stack icon and text vertically

  &:hover {
    transform: translateY(-5px); // Lift effect on hover
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
  }
`;

const FeatureIconWrapper = styled.div`
  font-size: 2rem; // Larger icon size
  color: ${() => theme.colors.primary}; // Use primary color for icons
  margin-bottom: ${() => theme.spacing.medium};
  width: 50px; // Fixed width/height for icon bg
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(79, 70, 229, 0.1); // Subtle background for icon
  border-radius: 50%; // Circular background
`;

const FeatureTitle = styled.h4`
  font-size: 1.3rem; // Larger title
  font-weight: 600;
  margin-bottom: ${() => theme.spacing.small};
  color: ${() => theme.colors.white};
`;

const FeatureDescription = styled.p`
  font-size: 1rem; // Slightly larger description
  color: ${() => theme.colors.text};
  line-height: 1.6; // Improved line height
`;

// --- Comparison Section ---

const ComparisonSection = styled.section`
  padding: 80px ${() => theme.spacing.large}; // Increased padding
  background: linear-gradient(180deg, ${() => theme.colors.background} 0%, #11141d 100%); // Darker gradient
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ComparisonTable = styled.table`
  width: 100%;
  max-width: 900px;
  border-collapse: separate; // Use separate for border-radius on cells
  border-spacing: 0;
  margin-top: 40px; // Increased margin
  background-color: #1F2937; // Darker background for table
  border-radius: 8px; // Rounded corners for table
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);

  th, td {
    padding: ${() => theme.spacing.medium} ${() => theme.spacing.large}; // More padding
    text-align: left;
    border-bottom: 1px solid ${() => theme.colors.border};
    vertical-align: middle; // Align content vertically
  }

  th {
    background-color: #374151;
    color: ${() => theme.colors.white};
    font-weight: 600;
    font-size: 1.1rem; // Slightly larger header font
  }

   // Remove bottom border for last row
   tbody tr:last-child td {
     border-bottom: none;
   }

  // Style first column (Feature names)
  td:first-child {
    font-weight: 500;
    color: ${() => theme.colors.white};
    width: 50%; // Allocate more space for feature names
  }

  td {
    color: ${() => theme.colors.text};
    text-align: center;
  }

  // Highlight Premium column
  th:nth-child(3),
  td:nth-child(3) {
    background-color: rgba(79, 70, 229, 0.05); // Subtle premium bg highlight
  }


  .icon-cell {
    font-size: 1.5rem; // Larger icons
  }

  .check {
    color: #10B981; // Green
  }

  .cross {
    color: #EF4444; // Red
  }

   .premium-icon {
      color: #F59E0B; // Amber/Gold for Premium
      margin-left: 8px; // More space for crown
      vertical-align: middle;
    }

   .future-span {
       font-size: 0.85rem;
       font-style: italic;
       opacity: 0.8;
   }
`;

const ComparisonFooterText = styled.p`
    font-size: 0.9rem;
    margin-top: ${() => theme.spacing.medium};
    color: ${() => theme.colors.text};
    opacity: 0.8;
    max-width: 900px;
    text-align: center;
`;

const PremiumCTAWrapper = styled.div`
    margin-top: ${() => theme.spacing.large};
`;

// --- Footer ---

const Footer = styled.footer`
  padding: ${() => theme.spacing.large} ${() => theme.spacing.large}; // More padding
  background-color: #111827; // Darker background
  border-top: 1px solid ${() => theme.colors.border};
  text-align: center;
  color: ${() => theme.colors.text};
  font-size: 0.9rem;

  a {
    color: ${() => theme.colors.primary};
    text-decoration: none;
    margin: 0 ${() => theme.spacing.small};
    transition: color 0.2s ease;
    &:hover {
      text-decoration: underline;
      color: ${() => theme.colors.primaryHover};
    }
  }
`;

// --- Data (Add Icons) ---

const features = [
  { icon: FaColumns, title: "Multi-Stream Viewing", description: "Watch multiple YouTube streams simultaneously in one clean interface." },
  { icon: FaThLarge, title: "Flexible Grid Layouts", description: "Easily arrange your streams in various grid configurations to suit your needs." },
  { icon: FaListUl, title: "Save Channels", description: "Add and manage your favorite channels in a personalized list for quick access." },
  { icon: FaSave, title: "Save Custom Layouts (Premium)", description: "Create your perfect setup and save it to load instantly with a single click." }, // Example Premium feature highlight
];

const comparisonData = [
  { feature: "Basic Multi-Stream Viewing", free: true, premium: true },
  { feature: "Standard Grid Layouts (e.g., 2x2)", free: true, premium: true },
  { feature: "Channel Save Limit (e.g., 20)", free: true, premium: false },
  { feature: "Grid Cell Limit (e.g., 12)", free: true, premium: false },
  { feature: "Advanced Grid Layouts (3x3, 4x3+)", free: false, premium: true },
  { feature: "Save/Load Custom Layouts", free: false, premium: true },
  { feature: "Channel Folders/Grouping", free: false, premium: true },
  { feature: "Increased/Unlimited Save Limits", free: false, premium: true },
  { feature: "Cross-Device Sync", free: false, premium: "Soon" }, // Changed "Gelecek" to "Soon"
  { feature: "Multiple Profiles/Workspaces", free: false, premium: "Soon" }, // Changed "Gelecek" to "Soon"
  { feature: "Ad-Free Experience*", free: false, premium: true },
];

// --- Page Component ---

export default function LandingPage() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <LandingPageWrapper>
        <Navbar>
          <LogoContainer>
            <LogoIcon />
            <LogoText>TubeTopia</LogoText>
          </LogoContainer>
          <NavLinks>
            <NavLink href="#features">Features</NavLink>
            <NavLink href="#pricing">Plans</NavLink>
             {/* Add other links if needed */}
          </NavLinks>
          <NavbarCTA href="/watch" $primary={false}>
              Open App
              <FaSignInAlt />
          </NavbarCTA>
        </Navbar>

        <MainContent>
          <HeroSection>
            <HeroTitle>All Your YouTube Streams, One Screen</HeroTitle>
            <HeroSubtitle>
              Watch, manage, and never miss a moment from multiple YouTube streams simultaneously with TubeTopia.
              Flexible, powerful, and completely under your control.
            </HeroSubtitle>
            <HeroCTAWrapper>
                <CTAButton href="/watch">
                    Start Free Now
                    <FaRocket />
                 </CTAButton>
                 {/* Optional Secondary CTA */}
                 {/* <CTAButton href="#pricing" $primary={false}>View Plans</CTAButton> */}
             </HeroCTAWrapper>
             {/* Placeholder image - replace with actual screenshot/graphic */}
            <HeroImage src="/placeholder-screenshot.png" alt="TubeTopia Application Interface Multi-Stream View" />
          </HeroSection>

          <FeaturesSection id="features">
            <SectionTitle>Take Control</SectionTitle>
            <FeaturesGrid>
              {features.map((feature, index) => (
                <FeatureCard key={index}>
                   <FeatureIconWrapper>
                      <feature.icon />
                    </FeatureIconWrapper>
                  <FeatureTitle>{feature.title}</FeatureTitle>
                  <FeatureDescription>{feature.description}</FeatureDescription>
                </FeatureCard>
              ))}
            </FeaturesGrid>
          </FeaturesSection>

          <ComparisonSection id="pricing">
            <SectionTitle>Choose Your Plan</SectionTitle>
            <ComparisonTable>
              <thead>
                <tr>
                  <th>Feature</th>
                  <th>Free</th>
                  <th>Premium <FaCrown className="premium-icon" /></th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((item, index) => (
                  <tr key={index}>
                    <td>{item.feature.replace('*$','')}</td> {/* Keep removal of asterisk */}
                    <td className="icon-cell">
                      {item.free === true ? <FaCheckCircle className="check" /> : <FaTimesCircle className="cross" />}
                    </td>
                    <td className="icon-cell">
                      {item.premium === true ? <FaCheckCircle className="check" /> :
                       item.premium === false ? <FaTimesCircle className="cross" /> :
                       item.premium === "Soon" ? <span className="future-span">Soon</span> : ''} {/* Changed "Gelecek" to "Soon" */}
                    </td>
                  </tr>
                ))}
              </tbody>
            </ComparisonTable>
             <ComparisonFooterText>
                *Ads are not currently present in the free version. If added in the future, the Premium version will remain ad-free.
                Features marked as "Soon" are under development.
             </ComparisonFooterText>
             <PremiumCTAWrapper>
                 <CTAButton href="/#"> {/* Link to signup/payment page later */}
                     Go Premium
                     <FaRocket />
                 </CTAButton>
             </PremiumCTAWrapper>
          </ComparisonSection>

        </MainContent>

        <Footer>
          © {new Date().getFullYear()} TubeTopia. All rights reserved. |
          <Link href="/terms">Terms of Service</Link> |
          <Link href="/privacy">Privacy Policy</Link>
           {/* TODO: Create these pages or remove links */}
        </Footer>
      </LandingPageWrapper>
    </ThemeProvider>
  );
} 