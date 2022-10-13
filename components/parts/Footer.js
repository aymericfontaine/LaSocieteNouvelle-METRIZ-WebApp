// La Societe Nouvelle

// React
import React from "react";
import { Col, Container, Row } from "react-bootstrap";

export function Footer() {
  const getCurrentYear = () => {
    return new Date().getFullYear();
  };

  return (
    <footer>
      <Container fluid>
        <Row>
          <Col>
            <p>
              &copy; {getCurrentYear()} La Société Nouvelle
            </p>
          </Col>
          <Col>
              <div className="text-end">

              <ul>
                <li>
                  <a href="/a-propos">A propos</a>
                </li>
                <li>
                  <a href="/conditions-generales-utilisation" >Conditions générales d'utilisation</a>
                </li>
                <li>
                  <a href="/confidentialite-des-donnees">Confidentialités des Données
</a>
                </li>
                <li>
                  <a href="https://github.com/La-Societe-Nouvelle/LaSocieteNouvelle-METRIZ-WebApp/" target="_blank">Code source</a>
                </li>
              </ul>
              </div>
          </Col>
        </Row>

      </Container>
    </footer>
  );

}
