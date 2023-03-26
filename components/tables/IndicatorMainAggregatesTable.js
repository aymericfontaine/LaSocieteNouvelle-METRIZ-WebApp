// La Société Nouvelle

// Utils
import { printValue } from "/src/utils/Utils";

// Libraries
import metaIndics from "/lib/indics";
import {
  buildFixedCapitalConsumptionsAggregates,
  buildIntermediateConsumptionsAggregates,
} from "../../src/formulas/aggregatesBuilder";
import { useEffect, useState } from "react";

// Chart
import SigPieChart from "../charts/SigPieChart";

import { Button, Col, Row, Table } from "react-bootstrap";
import { exportIndicXLSX } from "../../src/writers/ExportXLSX";

/* ---------- INDICATOR STATEMENT TABLE ---------- */

export const IndicatorMainAggregatesTable = ({
  indic,
  session,
  period,
  prevPeriod,
}) => {
  const financialData = session.financialData;
  const nbDecimals = metaIndics[indic].nbDecimals;
  const unit = metaIndics[indic].unit;
  const unitGrossImpact = metaIndics[indic].unitAbsolute;
  const printGrossImpact = ["ghg", "haz", "mat", "nrg", "was", "wat"].includes(
    indic
  );

  const [
    intermediateConsumptionsAggregates,
    setIntermediateConsumptionsAggregates,
  ] = useState([]);
  const [
    fixedCapitalConsumptionsAggregates,
    setFixedCapitalConsumptionsAggregates,
  ] = useState([]);

  const [
    prevIntermediateConsumptionsAggregates,
    setPrevIntermediateConsumptionsAggregates,
  ] = useState([]);
  const [
    prevFixedCapitalConsumptionsAggregates,
    setPrevFixedCapitalConsumptionsAggregates,
  ] = useState([]);

  useEffect(async () => {
    // Current Aggregates
    const intermediateConsumptionsAggregates =
      await buildIntermediateConsumptionsAggregates(
        financialData,
        period.periodKey
      );
    setIntermediateConsumptionsAggregates(intermediateConsumptionsAggregates);

    const fixedCapitalConsumptionsAggregates =
      await buildFixedCapitalConsumptionsAggregates(
        financialData,
        period.periodKey
      );
    setFixedCapitalConsumptionsAggregates(fixedCapitalConsumptionsAggregates);

    // Previous Aggretates
    if (prevPeriod) {
      const prevIntermediateConsumptionsAggregates =
        await buildIntermediateConsumptionsAggregates(
          financialData,
          prevPeriod.periodKey
        );
      const filteredPrevIntermediateConsumptionsAggregates =
        prevIntermediateConsumptionsAggregates.filter(
          (aggregate) => aggregate.amount != 0
        );
      setPrevIntermediateConsumptionsAggregates(
        filteredPrevIntermediateConsumptionsAggregates
      );

      const prevFixedCapitalConsumptionsAggregates =
        await buildFixedCapitalConsumptionsAggregates(
          financialData,
          prevPeriod.periodKey
        );
      const filteredPrevFixedCapitalConsumptionsAggregates =
        prevFixedCapitalConsumptionsAggregates.filter(
          (aggregate) => aggregate.amount != 0
        );

      setPrevFixedCapitalConsumptionsAggregates(
        filteredPrevFixedCapitalConsumptionsAggregates
      );
    }
  }, []);

  const { revenue, storedProduction, immobilisedProduction } =
    financialData.productionAggregates;

  const {
    production,
    intermediateConsumptions,
    fixedCapitalConsumptions,
    netValueAdded,
  } = financialData.mainAggregates;

  return (
    <>
      <Table id="mainAggregates" size="sm" responsive>
        <thead>
          <tr>
            <th>Agrégat</th>
            <th colSpan={printGrossImpact ? "4" : "3"} className="text-center">
              Année N
            </th>
            {prevPeriod && (
              <th colSpan={printGrossImpact ? "4" : "3"} className="text-center border-left">
                N-1
              </th>
            )}
          </tr>
          <tr>
            <td></td>
            <td className="text-end">Montant </td>
            <td className="text-end">Empreinte</td>
            <td className="text-end pe-3">Incertitude</td>
            {printGrossImpact && <td className="text-end">Impact</td>}
            {prevPeriod && (
              <>
                <td className="text-end border-left ">Empreinte</td>
                <td className="text-end  pe-3">Incertitude</td>
                {printGrossImpact && <td className="text-end  pe-3">Impact</td>}
              </>
            )}
          </tr>
          <tr className="small fw-normal">
            <td></td>
            <td className="text-end">&euro; </td>
            <td className="text-end">{unit}</td>
            <td className="text-end  pe-3">%</td>
            {printGrossImpact && <td className="text-end"> {unitGrossImpact}</td> }
            {prevPeriod && (
              <>
                <td className="text-end border-left">{unit}</td>
                <td className="text-end  pe-3">%</td>
                {printGrossImpact && <td className="text-end  pe-3"> {unitGrossImpact}</td>}
              </>
            )}
          </tr>
        </thead>
        <tbody>
          <tr className="fw-bold">
            <td>Production</td>
            <td className="text-end">
              {printValue(production.periodsData[period.periodKey].amount, 0)}
            </td>
            <td className="text-end">
              {printValue(
                production.periodsData[period.periodKey].footprint.indicators[
                  indic
                ].getValue(),
                nbDecimals
              )}
            </td>
            <td className="text-end  pe-3">
              <u>+</u>
              {printValue(
                production.periodsData[period.periodKey].footprint.indicators[
                  indic
                ].getUncertainty(),
                0
              )}
            </td>
            {printGrossImpact && (
              <td className="text-end">
                {printValue(
                  production.periodsData[period.periodKey].footprint.indicators[
                    indic
                  ].getGrossImpact(
                    production.periodsData[period.periodKey].amount
                  ),
                  nbDecimals
                )}
              </td>
            ) }

            {prevPeriod && (
              <> 
                <td className="text-end border-left">
                  {printValue(
                    production.periodsData[
                      prevPeriod.periodKey
                    ].footprint.indicators[indic].getValue(),
                    nbDecimals
                  )}{" "}

                </td>
                <td className="text-end  pe-3">
                  <u>+</u>
                  {printValue(
                    production.periodsData[
                      prevPeriod.periodKey
                    ].footprint.indicators[indic].getUncertainty(),
                    0
                  )}
                  
                </td>
                {printGrossImpact ? (
                  <td className="text-end">
                    {printValue(
                      production.periodsData[
                        prevPeriod.periodKey
                      ].footprint.indicators[indic].getGrossImpact(
                        production.periodsData[prevPeriod.periodKey].amount
                      ),
                      nbDecimals
                    )}
                   
                  </td>
                ) : null}
              </>
            )}
          </tr>
          <tr>
            <td>&emsp;Production vendue</td>
            <td className="text-end">
              {printValue(revenue.periodsData[period.periodKey].amount, 0)}{" "}
              
            </td>
            <td className="text-end">
              {printValue(
                revenue.periodsData[period.periodKey].footprint.indicators[
                  indic
                ].getValue(),
                nbDecimals
              )}{" "}
              <span className="unit"></span>
            </td>
            <td className="text-end  pe-3">
              <u>+</u>
              {printValue(
                revenue.periodsData[period.periodKey].footprint.indicators[
                  indic
                ].getUncertainty(),
                0
              )}
              
            </td>
            {printGrossImpact ? (
              <td className="text-end">
                {printValue(
                  revenue.periodsData[period.periodKey].footprint.indicators[
                    indic
                  ].getGrossImpact(
                    revenue.periodsData[period.periodKey].amount
                  ),
                  nbDecimals
                )}
                
              </td>
            ) : null}
            {prevPeriod && (
              <>
                <td className="text-end border-left">
                  {printValue(
                    revenue.periodsData[
                      prevPeriod.periodKey
                    ].footprint.indicators[indic].getValue(),
                    nbDecimals
                  )}{" "}

                </td>
                <td className="text-end  pe-3">
                  <u>+</u>
                  {printValue(
                    revenue.periodsData[
                      prevPeriod.periodKey
                    ].footprint.indicators[indic].getUncertainty(),
                    0
                  )}
                  
                </td>
                {printGrossImpact && (
                  <td className="text-end">
                    {printValue(
                      revenue.periodsData[
                        prevPeriod.periodKey
                      ].footprint.indicators[indic].getGrossImpact(
                        revenue.periodsData[prevPeriod.periodKey].amount
                      ),
                      nbDecimals
                    )}
                    
                  </td>
                ) }
              </>
            )}
          </tr>
          {storedProduction != 0 && (
            <tr>
              <td>&emsp;Production stockée</td>
              <td className="text-end">
                {printValue(
                  storedProduction.periodsData[period.periodKey].amount,
                  0
                )}{" "}
                
              </td>
              <td className="text-end">
                {printValue(
                  storedProduction.periodsData[
                    period.periodKey
                  ].footprint.indicators[indic].getValue(),
                  nbDecimals
                )}{" "}
                <span className="unit"></span>
              </td>
              <td className="text-end  pe-3">
                <u>+</u>
                {printValue(
                  storedProduction.periodsData[
                    period.periodKey
                  ].footprint.indicators[indic].getUncertainty(),
                  0
                )}
                
              </td>
              {printGrossImpact && (
                <td className="text-end">
                  {printValue(
                    storedProduction.periodsData[
                      period.periodKey
                    ].footprint.indicators[indic].getGrossImpact(
                      storedProduction.periodsData[period.periodKey].amount
                    ),
                    nbDecimals
                  )}
                  
                </td>
              ) }

              {prevPeriod && (
                <>
                  <td className="text-end border-left">
                    {printValue(
                      storedProduction.periodsData[
                        prevPeriod.periodKey
                      ].footprint.indicators[indic].getValue(),
                      nbDecimals
                    )}{" "}
  
                  </td>
                  <td className="text-end  pe-3">
                    <u>+</u>
                    {printValue(
                      storedProduction.periodsData[
                        prevPeriod.periodKey
                      ].footprint.indicators[indic].getUncertainty(),
                      0
                    )}
                    
                  </td>
                  {printGrossImpact && (
                    <td className="text-end">
                      {printValue(
                        storedProduction.periodsData[
                          prevPeriod.periodKey
                        ].footprint.indicators[indic].getGrossImpact(
                          storedProduction.periodsData[period.periodKey].amount
                        ),
                        nbDecimals
                      )}
                      
                    </td>
                  ) }
                </>
              )}
            </tr>
          )}
          {immobilisedProduction.periodsData[period.periodKey].amount > 0 && (
            <tr>
              <td>&emsp;Production immobilisée</td>
              <td className="text-end">
                {printValue(
                  immobilisedProduction.periodsData[period.periodKey].amount,
                  0
                )}
              </td>
              <td className="text-end">
                {printValue(
                  immobilisedProduction.periodsData[
                    period.periodKey
                  ].footprint.indicators[indic].getValue(),
                  nbDecimals
                )}{" "}
                <span className="unit"></span>
              </td>
              <td className="text-end  pe-3">
                <u>+</u>
                {printValue(
                  immobilisedProduction.periodsData[
                    period.periodKey
                  ].footprint.indicators[indic].getUncertainty(),
                  0
                )}
                
              </td>
              {printGrossImpact && (
                <td className="text-end">
                  (
                  {printValue(
                    immobilisedProduction.periodsData[
                      period.periodKey
                    ].footprint.indicators[indic].getGrossImpact(
                      immobilisedProduction.periodsData[period.periodKey].amount
                    ),
                    nbDecimals
                  )}
                  )<span className="unit"> </span>
                </td>
              ) }

              {prevPeriod && (
                <>
                  <td className="text-end border-left">
                    {printValue(
                      immobilisedProduction.periodsData[
                        prevPeriod.periodKey
                      ].footprint.indicators[indic].getValue(),
                      nbDecimals
                    )}{" "}
  
                  </td>
                  <td className="text-end  pe-3">
                    <u>+</u>
                    {printValue(
                      immobilisedProduction.periodsData[
                        prevPeriod.periodKey
                      ].footprint.indicators[indic].getUncertainty(),
                      0
                    )}
                    
                  </td>
                  {printGrossImpact && (
                    <td className="text-end">
                      (
                      {printValue(
                        immobilisedProduction.periodsData[
                          prevPeriod.periodKey
                        ].footprint.indicators[indic].getGrossImpact(
                          immobilisedProduction.periodsData[
                            prevPeriod.periodKey
                          ].amount
                        ),
                        nbDecimals
                      )}
                      )<span className="unit"> </span>
                    </td>
                  ) }
                </>
              )}
            </tr>
          )}
          <tr className="border-top  fw-bold">
            <td>Consommations intermédiaires</td>
            <td className="text-end">
              {printValue(
                intermediateConsumptions.periodsData[period.periodKey].amount,
                0
              )}{" "}
              
            </td>
            <td className="text-end">
              {printValue(
                intermediateConsumptions.periodsData[
                  period.periodKey
                ].footprint.indicators[indic].getValue(),
                nbDecimals
              )}{" "}
              <span className="unit"></span>
            </td>
            <td className="text-end  pe-3">
              <u>+</u>
              {printValue(
                intermediateConsumptions.periodsData[
                  period.periodKey
                ].footprint.indicators[indic].getUncertainty(),
                0
              )}
              
            </td>
            {printGrossImpact && (
              <td className="text-end">
                {printValue(
                  intermediateConsumptions.periodsData[
                    period.periodKey
                  ].footprint.indicators[indic].getGrossImpact(
                    intermediateConsumptions.periodsData[period.periodKey]
                      .amount
                  ),
                  nbDecimals
                )}
                
              </td>
            ) }

            {prevPeriod && (
              <>
                <td className="text-end border-left">
                  {printValue(
                    intermediateConsumptions.periodsData[
                      prevPeriod.periodKey
                    ].footprint.indicators[indic].getValue(),
                    nbDecimals
                  )}{" "}

                </td>
                <td className="text-end  pe-3">
                  <u>+</u>
                  {printValue(
                    intermediateConsumptions.periodsData[
                      prevPeriod.periodKey
                    ].footprint.indicators[indic].getUncertainty(),
                    0
                  )}
                  
                </td>
                {printGrossImpact && (
                  <td className="text-end">
                    {printValue(
                      intermediateConsumptions.periodsData[
                        prevPeriod.periodKey
                      ].footprint.indicators[indic].getGrossImpact(
                        intermediateConsumptions.periodsData[
                          prevPeriod.periodKey
                        ].amount
                      ),
                      nbDecimals
                    )}
                    
                  </td>
                ) }
              </>
            )}
          </tr>

          {intermediateConsumptionsAggregates
            .filter((aggregate) => aggregate.amount != 0)
            .map(({ label, amount, footprint }, index) => (
              <tr key={index}>
                <td>&emsp;{label}</td>
                <td className="text-end">{printValue(amount, 0)} </td>
                <td className="text-end">
                  {printValue(
                    footprint.indicators[indic].getValue(),
                    nbDecimals
                  )}{" "}

                </td>
                <td className="text-end  pe-3">
                  <u>+</u>
                  {printValue(footprint.indicators[indic].getUncertainty(), 0)}
                </td>
                {printGrossImpact && (
                  <td className="text-end">
                    {printValue(
                      footprint.indicators[indic].getGrossImpact(amount),
                      nbDecimals
                    )}
                    
                  </td>
                ) }
                {prevPeriod &&
                  prevIntermediateConsumptionsAggregates.length > 0 && (
                    <>
                      <td className="text-end border-left">
                        {printValue(
                          prevIntermediateConsumptionsAggregates[
                            index
                          ].footprint.indicators[indic].getValue(),
                          nbDecimals
                        )}{" "}
      
                      </td>
                      <td className="text-end  pe-3">
                        <u>+</u>
                        {printValue(
                          prevIntermediateConsumptionsAggregates[
                            index
                          ].footprint.indicators[indic].getUncertainty(),
                          0
                        )}
                        
                      </td>
                      {printGrossImpact && (
                        <td className="text-end">
                          {printValue(
                            prevIntermediateConsumptionsAggregates[
                              index
                            ].footprint.indicators[indic].getGrossImpact(
                              amount
                            ),
                            nbDecimals
                          )}
                          
                        </td>
                      ) }
                    </>
                  )}
              </tr>
            ))}

          <tr className="border-top  fw-bold">
            <td>Consommations de capital fixe</td>
            <td className="text-end">
              {printValue(
                fixedCapitalConsumptions.periodsData[period.periodKey].amount,
                0
              )}{" "}
              
            </td>
            <td className="text-end">
              {printValue(
                fixedCapitalConsumptions.periodsData[
                  period.periodKey
                ].footprint.indicators[indic].getValue(),
                nbDecimals
              )}{" "}
              <span className="unit"></span>
            </td>
            <td className="text-end  pe-3">
              <u>+</u>
              {printValue(
                fixedCapitalConsumptions.periodsData[
                  period.periodKey
                ].footprint.indicators[indic].getUncertainty(),
                0
              )}
              
            </td>
            {printGrossImpact && (
              <td className="text-end">
                {printValue(
                  fixedCapitalConsumptions.periodsData[
                    period.periodKey
                  ].footprint.indicators[indic].getGrossImpact(
                    fixedCapitalConsumptions.periodsData[period.periodKey]
                      .amount
                  ),
                  nbDecimals
                )}{" "}
               
              </td>
            ) }
            {prevPeriod && (
              <>
                <td className="text-end border-left">
                  {printValue(
                    fixedCapitalConsumptions.periodsData[
                      prevPeriod.periodKey
                    ].footprint.indicators[indic].getValue(),
                    nbDecimals
                  )}{" "}

                </td>
                <td className="text-end  pe-3">
                  <u>+</u>
                  {printValue(
                    fixedCapitalConsumptions.periodsData[
                      prevPeriod.periodKey
                    ].footprint.indicators[indic].getUncertainty(),
                    0
                  )}
                  
                </td>
                {printGrossImpact && (
                  <td className="text-end">
                    {printValue(
                      fixedCapitalConsumptions.periodsData[
                        prevPeriod.periodKey
                      ].footprint.indicators[indic].getGrossImpact(
                        fixedCapitalConsumptions.periodsData[
                          prevPeriod.periodKey
                        ].amount
                      ),
                      nbDecimals
                    )}{" "}
                   
                  </td>
                )}
              </>
            )}
          </tr>

          {fixedCapitalConsumptionsAggregates
            .filter((aggregate) => aggregate.amount != 0)
            .map(({ label, amount, footprint }, index) => (
              <tr key={index}>
                <td>&emsp;{label}</td>
                <td className="text-end">{printValue(amount, 0)} </td>
                <td className="text-end">
                  {printValue(
                    footprint.indicators[indic].getValue(),
                    nbDecimals
                  )}{" "}
                  <span className="unit">  </span>
                </td>
                <td className="text-end  pe-3">
                  <u>+</u>
                  {printValue(footprint.indicators[indic].getUncertainty(), 0)}
                </td>
                {printGrossImpact && (
                  <td className="text-end">
                    {printValue(
                      footprint.indicators[indic].getGrossImpact(amount),
                      nbDecimals
                    )}
                    
                  </td>
                ) }
                {prevPeriod &&
                  prevFixedCapitalConsumptionsAggregates.length > 0 && (
                    <>
                      <td className="text-end border-left">
                        {printValue(
                          prevFixedCapitalConsumptionsAggregates[
                            index
                          ].footprint.indicators[indic].getValue(),
                          nbDecimals
                        )}{" "}
                        <span className="unit">  </span>
                      </td>
                      <td className="text-end  pe-3">
                        <u>+</u>
                        {printValue(
                          prevFixedCapitalConsumptionsAggregates[
                            index
                          ].footprint.indicators[indic].getUncertainty(),
                          0
                        )}
                        
                      </td>
                      {printGrossImpact && (
                        <td className="text-end">
                          {printValue(
                            prevFixedCapitalConsumptionsAggregates[
                              index
                            ].footprint.indicators[indic].getGrossImpact(
                              amount
                            ),
                            nbDecimals
                          )}
                          
                        </td>
                      ) }
                    </>
                  )}
              </tr>
            ))}

          <tr className="border-top  fw-bold">
            <td>Valeur ajoutée nette</td>
            <td className="text-end">
              {printValue(
                netValueAdded.periodsData[period.periodKey].amount,
                0
              )}{" "}
              
            </td>
            <td className="text-end">
              {printValue(
                netValueAdded.periodsData[
                  period.periodKey
                ].footprint.indicators[indic].getValue(),
                nbDecimals
              )}{" "}
              <span className="unit"></span>
            </td>
            <td className="text-end  pe-3">
              <u>+</u>
              {printValue(
                netValueAdded.periodsData[
                  period.periodKey
                ].footprint.indicators[indic].getUncertainty(),
                0
              )}
              
            </td>
            {printGrossImpact && (
              <td className="text-end" title="Impact direct de l'entreprise">
                {printValue(
                  netValueAdded.periodsData[
                    period.periodKey
                  ].footprint.indicators[indic].getGrossImpact(
                    netValueAdded.periodsData[period.periodKey].amount
                  ),
                  nbDecimals
                )}
                
              </td>
            ) }
            {prevPeriod && (
              <>
                <td className="text-end border-left">
                  {printValue(
                    netValueAdded.periodsData[
                      prevPeriod.periodKey
                    ].footprint.indicators[indic].getValue(),
                    nbDecimals
                  )}{" "}

                </td>
                <td className="text-end  pe-3">
                  <u>+</u>
                  {printValue(
                    netValueAdded.periodsData[
                      prevPeriod.periodKey
                    ].footprint.indicators[indic].getUncertainty(),
                    0
                  )}
                  
                </td>
                {printGrossImpact && (
                  <td
                    className="text-end"
                    title="Impact direct de l'entreprise"
                  >
                    {printValue(
                      netValueAdded.periodsData[
                        prevPeriod.periodKey
                      ].footprint.indicators[indic].getGrossImpact(
                        netValueAdded.periodsData[prevPeriod.periodKey].amount
                      ),
                      nbDecimals
                    )}
                    
                  </td>
                )}
              </>
            )}
          </tr>
        </tbody>
      </Table>
      <div className="text-end">
        <Button
          variant="tertiary"
          size="sm"
          className="me-0 mb-2"
          onClick={() => exportIndicXLSX(indic, session, period)}
        >
          Télécharger les données <i className="bi bi-download"></i>
        </Button>
      </div>
      {metaIndics[indic].type == "proportion" && (
        <Row>
          <hr />
          <Col>
            <h5 className="mb-4 text-center">▪ Production</h5>
            <div className="doughtnut-chart-container">
              <SigPieChart
                value={printValue(
                  production.periodsData[period.periodKey].footprint.indicators[
                    indic
                  ].value,
                  nbDecimals
                )}
                title={"Production"}
                id={"prd-" + indic}
              />
            </div>
          </Col>
          <Col>
            <h5 className="mb-4 text-center">▪ Consommations intermédiaires</h5>
            <div className="doughtnut-chart-container">
              <SigPieChart
                value={printValue(
                  intermediateConsumptions.periodsData[period.periodKey]
                    .footprint.indicators[indic].value,
                  nbDecimals
                )}
                title={"Consommations intermédiaires"}
                id={"ic-" + indic}
              />
            </div>
          </Col>
          <Col>
            <h5 className="mb-4 text-center">
              ▪ Consommations de capital fixe
            </h5>
            <div className="doughtnut-chart-container">
              <SigPieChart
                value={printValue(
                  fixedCapitalConsumptions.periodsData[period.periodKey]
                    .footprint.indicators[indic].value,
                  nbDecimals
                )}
                title={"Consommation de capital fixe"}
                id={"ccf-" + indic}
              />
            </div>
          </Col>
          <Col>
            <h5 className="mb-4 text-center">▪ Valeur ajoutée nette</h5>
            <div className="doughtnut-chart-container">
              <SigPieChart
                value={printValue(
                  netValueAdded.periodsData[
                    period.periodKey
                  ].footprint.indicators[indic].getValue(),
                  nbDecimals
                )}
                title={"Valeur ajoutée nette"}
                id={"nva-" + indic}
              />
            </div>
          </Col>
        </Row>
      )}
    </>
  );
};
