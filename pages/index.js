// La Société Nouvelle

// React / Next
import React from "react";
import Head from "next/head";
import { BrowserView, MobileView } from "react-device-detect";

// Objects
import { Session } from "/src/Session";

// Sections
import { StartSection } from "/src/components/sections/StartSection";
import AccountingImportSection from "/src/components/sections/accountingImport";
import { InitialStatesSection } from "/src/components/sections/initialStates";
import ProvidersSection  from "/src/components/sections/providers";
import DirectImpacts from "/src/components/sections/statements";
import Results from "/src/components/sections/results";
import PublishStatementSection from "/src/components/sections/publishStatement";

// Others components
import { Header } from "/src/components/parts/headers/Header";
import { HeaderSection } from "/src/components/parts/headers/HeaderSection";
import { HeaderPublish } from "/src/components/parts/headers/HeaderPublish";

import { updateVersion } from "/src/version/updateVersion";
import { Footer } from "/src/components/parts/Footer";
import { Mobile } from "/src/components/Mobile";
import { DataUpdater } from "/src/components/modals/dataUpdater/DataUpdater";
import SaveModal from "/src/components/modals/SaveModal";
import ErrorBoundary from "/src/utils/ErrorBoundary";

// Services
import { logUserProgress } from "/src/services/StatsService";

/*   _________________________________________________________________________________________________________
 *  |                                                                                                         |
 *  |   _-_ _-_- -_-_                                                                                         |
 *  |   -\-_\/-_-_/_-                                                                                         |
 *  |    -|_ \  / '-                  ___   __   __ .  __  ___  __          __               __          __   |
 *  |    _-\_-|/  _ /    |     /\    |     |  | |   | |     |  |     |\  | |  | |  | \    / |   |   |   |     |
 *  |        ||    |     |    /__\   |---| |  | |   | |-    |  |-    | \ | |  | |  |  \  /  |-  |   |   |-    |
 *  |       _||_  /'\    |__ /    \   ___| |__| |__ | |__   |  |__   |  \| |__| |__|   \/   |__ |__ |__ |__   |
 *  |                                                                                                         |
 *  |                                                                             Let's change the world...   |
 *  |_________________________________________________________________________________________________________|
 */

/* -------------------------------------------------------------------------------------- */
/* ---------------------------------------- HOME ---------------------------------------- */
/* -------------------------------------------------------------------------------------- */

export default function Home() {
  return (
    <>
      <Head>
        <title>METRIZ by La Société Nouvelle</title>
        <meta
          name="description"
          content="Metriz est une application web libre et open source qui vous permet de faire le lien entre vos données comptables, les empreintes sociétales de vos fournisseurs et vos impacts directs."
        />
        <meta property="og:title" content="Metriz by La Société Nouvelle" />
        <meta
          property="og:description"
          content="Metriz est une application web libre et open source qui vous permet de faire le lien entre vos données comptables, les empreintes sociétales de vos fournisseurs et vos impacts directs."
        />
        <meta property="og:type" content="website" />
        <meta
          property="og:url"
          content="https://metriz.lasocietenouvelle.org"
        />
        <meta property="og:image" content="/metriz_illus.jpg" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <BrowserView>
        <Metriz />
      </BrowserView>
      <MobileView>
        <Mobile />
      </MobileView>
    </>
  );
}

/* ------------------------------------------------------------------------------------- */
/* ---------------------------------------- APP ---------------------------------------- */
/* ------------------------------------------------------------------------------------- */

/** Notes :
 *    2 variables :
 *        - Session (données saisies) -> LegalUnit (données relatives à l'unité légale) / FinancialData (données comptables) / ImpactsData (données d'impacts)
 *        - step -> étape courante
 *        - showDataUpdater
 */

class Metriz extends React.Component {

  constructor(props) {
    super(props);
    this.state = 
    {
      session: new Session(),
      step: 0,
      loading: false,
      showDataUpdater: false,
      showSaveModal: false,
      date: new Date(),
    };
  }

  handleCloseModal = () => {
    this.setState({ showSaveModal: false });
  };

  render() {
    const { step, session, showDataUpdater, showSaveModal } = this.state;
    return (
      <>
        <div
          className={step == 0 ? "wrapper bg-white" : "wrapper"}
          id="wrapper"
        >
          {/* ---------- HEADER ---------- */}
          {step == 0 ? (
            <Header />
          ) : step == 6 ? (
            <HeaderPublish setStep={this.setStep} session={session} />
          ) : (
            <HeaderSection
              step={step}
              stepMax={session.progression}
              setStep={this.setStep}
              session={session}
            />
          )}

          {showDataUpdater && step > 3 && (
            <DataUpdater
              session={session}
              updatePrevSession={this.updatePrevSession}
            ></DataUpdater>
          )}

          {showSaveModal && (
            <SaveModal
              show={showSaveModal}
              handleClose={this.handleCloseModal}
              session={session}
            />
          )}

          {/* ---------- SECTION ---------- */}
          <ErrorBoundary session={session}>
            {this.buildSectionView(step)}
          </ErrorBoundary>
        </div>

        <Footer step={step} />
      </>
    );
  }

  // change session
  setStep = (nextStep) => this.setState({ step: nextStep });

  // Update previous session with updated session
  updatePrevSession = (updatedSession) => {
    this.setState({
      session: updatedSession,
    });
  };
  // import session (JSON data -> session)
  loadPrevSession = async (file) => {
    this.setState({ loading: true });
    const reader = new FileReader();

    reader.onload = async () => {
      // text -> JSON
      const prevProps = await JSON.parse(reader.result);
      console.log(prevProps.version);
      // update to current version
      await updateVersion(prevProps);

      // JSON -> session
      const session = new Session(prevProps);
      for (let period of session.availablePeriods) {
        await session.updateFootprints(period);
      }

      this.setState({
        session: session,
        step: session.progression,
        loading: false,
        showDataUpdater: prevProps.version == "3.0.0",
        showSaveModal: false,
      });
    };
    reader.readAsText(file);
  };

  /* ----- SECTION ----- */

  // ...redirect to the selected section
  buildSectionView = (step) => 
  {
    const { session } = this.state;

    const sectionProps = {
      session: session,
    };

    switch (step) {
      case 0:
        return (
          <StartSection
            startNewSession={() => this.setStep(1)}
            loadPrevSession={this.loadPrevSession}
            isLoading={this.state.loading}
          />
        );
      case 1:
        return (
          <AccountingImportSection
            {...sectionProps}
            submit={this.validImportedData}
          />
        );
      case 2:
        return (
          <InitialStatesSection
            {...sectionProps}
            submit={this.validInitialStates}
            onReturn={() => this.setStep(1)}
          />
        );
      case 3:
        return (
          <ProvidersSection {...sectionProps} submit={this.validProviders} />
        );
      case 4:
        return (
          <DirectImpacts {...sectionProps} submit={this.validStatements} />
        );
      case 5:
        return (
          <Results
            {...sectionProps}
            goBack={() => this.setStep(4)}
            publish={() => this.setStep(6)}
          />
        );
      case 6:
        return <PublishStatementSection {...sectionProps} />;
    }
  };

  /* ----- PROGESSION ---- */

  validImportedData = async () => {
    console.log("--------------------------------------------------");
    console.log("Ecritures comptables importées");
    console.log(this.state.session.financialData);

    // first year..
    // if (getAmountItems(this.state.session.financialData.immobilisations.concat(this.state.session.financialData.stocks).map(asset => asset.InitialState)) == 0) {
    //   this.state.session.progression++;
    // }

    let accountsShowed =
      this.state.session.financialData.immobilisations.concat(
        this.state.session.financialData.stocks
      );
    if (accountsShowed.length > 0) {
      this.setStep(2);
      this.updateProgression(1);
    } else {
      this.setStep(3);
      this.updateProgression(2);
    }

    // logs
    if (process.env.NODE_ENV === "production") {
      await logUserProgress(this.state.session.id, 1, this.state.date, []);
    }
  };

  validInitialStates = async () => {
    this.setStep(3);
    this.updateProgression(2);

    if (process.env.NODE_ENV === "production") {
      await logUserProgress(this.state.session.id, 2, this.state.date, []);
    }
  };

  validProviders = async () => {
    let availablePeriods = this.state.session.availablePeriods;
    for (let period of availablePeriods) {
      this.state.session.updateFootprints(period);
    }

    this.setStep(4);
    this.updateProgression(3);

    if (process.env.NODE_ENV === "production") {
      await logUserProgress(this.state.session.id, 3, this.state.date, []);
    }
  };
  validStatements = async () => {
    this.setStep(5);
    this.setState({ showSaveModal: true });

    this.updateProgression(4);

    const financialPeriod = this.state.session.financialPeriod.periodKey;
    if (process.env.NODE_ENV === "production") {
      await logUserProgress(
        this.state.session.id,
        4,
        this.state.date,
        this.state.session.validations[financialPeriod]
      );
    }
  };

  updateProgression = (step) => {
    this.state.session.progression = Math.max(
      step + 1,
      this.state.session.progression
    );
  };
}
