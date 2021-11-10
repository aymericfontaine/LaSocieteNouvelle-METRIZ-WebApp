// La Société Nouvelle

// Style
import styles from '../styles/Home.module.css';

// React / Next
import React from 'react';
import Head from 'next/head';

// Objects
import { Session } from '/src/Session';

// Sections
import { FinancialDataSection } from '/components/sections/FinancialDataSection';
import { CompaniesSection } from '/components/sections/CompaniesSection';
import { InitialStatesSection } from '/components/sections/InitialStatesSection';
import { IndicatorSection } from '/components/sections/IndicatorSection';
import { StatementSection } from '../components/sections/StatementSection';

// Others components
import { Header } from '/components/Header';
import { StartSection } from '/components/sections/startSection';
import { SirenSection } from '/components/sections/SirenSection';

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


/* ---------------------------------------------- */
/* -------------------- HOME -------------------- */
/* ---------------------------------------------- */

export default function Home() 
{
  return (
    <div className={styles.container}>
      <Head>
        <title>METRIZ by La Société Nouvelle</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.jpg" />
      </Head>
      <Metriz/>
    </div>
  )
}

/* --------------------------------------------- */
/* -------------------- APP -------------------- */
/* --------------------------------------------- */

/** Notes :
 * 
 */

class Metriz extends React.Component {

  constructor(props) 
  {
    super(props);
    this.state = 
    {
      session: new Session(),
      step: 0,
      selectedSection: "legalData",
    }
  }

  render() 
  {
    const {step,session} = this.state;

    return (
      <div className="app-view">
        <Header step={step} stepMax={session.progression} setStep={this.setStep} downloadSession={this.downloadSession}/>
        <div className="section-container">
          {this.buildSectionView(step)}
        </div>
      </div>
    )
  }

  // change selected session
  changeSection = (nextSelectedSection) => this.setState({selectedSection: nextSelectedSection})
  setStep = (nextStep) => this.setState({step: nextStep});

  // start new session
  startNewSession = () => 
  {
    this.setState({step: 1});
  }

  // download session (session -> JSON data)
  downloadSession = async () => 
  {
    // build JSON
    const session = this.state.session;
    const fileName = "svg_ese_"+session.legalUnit.siren; // To update
    const json = JSON.stringify(session);

    // build download link & activate
    const blob = new Blob([json],{type:'application/json'});
    const href = await URL.createObjectURL(blob);
    const link = document.createElement('a');
          link.href = href;
          link.download = fileName + ".json";    
          link.click();
  }

  // import session (JSON data -> session)
  loadPrevSession = (file) =>
  {
    const reader = new FileReader();
    reader.onload = async () => 
    {
      // text -> JSON
      const prevProps = JSON.parse(reader.result);

      // JSON -> session
      const session = new Session(prevProps);
      
      this.setState({
        session: session,
        step: session.progression,
        selectedSection: "legalData"
      })
    }
    reader.readAsText(file);
  }

  /* ----- SECTION ----- */

  // ...redirect to the selected section
  buildSectionView = (step) =>
  {
    const {session} = this.state;

    const sectionProps = {
      session: session,
      updateMenu: () => this.changeSection.bind(this)(step),
      submit: () => this.validStep(this.state.step)
    }

    switch(step)
    {
      case 0 : return(<StartSection startNewSession={this.startNewSession} 
                                    loadPrevSession={this.loadPrevSession}/>)
      case 1 : return(<SirenSection {...sectionProps}/>)
      case 2 : return(<FinancialDataSection {...sectionProps}/>)
      case 3 : return(<InitialStatesSection {...sectionProps}/>)
      case 4 : return(<CompaniesSection {...sectionProps}/>)
      case 5 : return(<IndicatorSection {...sectionProps} publish={this.publish}/>)
      case 6 : return(<StatementSection {...sectionProps}/>)
    }
  }

  /* ----- PROGESSION ---- */

  validStep = (step) =>
  {
    // Increase progression
    this.state.session.progression = Math.max(step+1,this.state.session.progression);
    // update current step
    this.setState({step: this.state.session.progression});
  }

  publish = () =>
  {
    this.setState({step: 6});
  }

  getProgression = (session) =>
  {
    const progression = {
      legalUnitOK: session.legalUnit.dataFetched && /[0-9]{4}/.test(session.legalUnit.year),
      financialDataOK: session.financialData.isFinancialDataLoaded,
      companiesOK: !(session.financialData.companies.filter(company => company.status != 200).length > 0),
      initialStatesOK: !(session.financialData.immobilisations.concat(session.financialData.stocks).filter(account => account.initialState=="defaultData" && !account.dataFetched).length > 0),
      publicationOK: /[0-9]{9}/.test(session.legalUnit.siren) && Object.entries(session.validations).filter(([_,validation]) => validation).length > 0
    }
    return progression;
  }

}