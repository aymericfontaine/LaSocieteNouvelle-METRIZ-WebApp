// La Société Nouvelle

// Utils
import { printValue } from "/src/utils/Utils";

// Libraries
import metaIndics from "/lib/indics";
import { Table } from "react-bootstrap";

/* ---------- INDICATOR STATEMENT TABLE ---------- */

export const IndicatorMainAggregatesTable = ({ indic, session }) => {

  const financialData = session.financialData;

  const nbDecimals = metaIndics[indic].nbDecimals;
  const unit = metaIndics[indic].unit;
  const unitGrossImpact = metaIndics[indic].unitAbsolute;
  const printGrossImpact = ["ghg", "haz", "mat", "nrg", "was", "wat"].includes(
    indic
  );

  const intermediateConsumptionsAggregates =
    getIntermediateConsumptionsAggregatesGroups(financialData);
  const fixedCapitalConsumptionsAggregates =
    getFixedCapitalConsumptionsAggregatesGroups(financialData);

  const {
    production,
    revenue,
    storedProduction,
    immobilisedProduction,
    intermediateConsumption,
    capitalConsumption,
    netValueAdded,
  } = financialData.aggregates;

  return (
    <>
      <Table id="mainAggregates" size="sm" responsive>
        <thead>
          <tr>
            <td>Agrégat</td>
            <td  className="text-end">Montant</td>
            <td  className="text-end">Empreinte</td>
            <td  className="text-end">Incertitude</td>
            {printGrossImpact ? (
              <td  className="text-end">
                Impact
              </td>
            ) : null}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="font-weight-bold">Production</td>
            <td  className="text-end">
              {printValue(production.amount, 0)} &euro;
            </td>
            <td  className="text-end">
              {printValue(
                production.footprint.indicators[indic].getValue(),
                nbDecimals
              )} <span className="unit">{unit}</span>
            </td>
            <td  className="text-end">
              <u>+</u>
              {printValue(
                production.footprint.indicators[indic].getUncertainty(),
                0
              )}
              %
            </td>
            {printGrossImpact ? (
              <td  className="text-end">
                {printValue(
                  production.footprint.indicators[indic].getGrossImpact(
                    production.amount
                  ),
                  nbDecimals
                )}<span className="unit"> {unitGrossImpact}</span>
              </td>
            ) : null}
          </tr>
          <tr>
            <td>&emsp;Production vendue</td>
            <td  className="text-end">
              {printValue(revenue.amount, 0)} &euro;
            </td>
            <td  className="text-end">
              {printValue(
                revenue.footprint.indicators[indic].getValue(),
                nbDecimals
              )} <span className="unit">{unit}</span>
            </td>
            <td  className="text-end">
              <u>+</u>
              {printValue(
                revenue.footprint.indicators[indic].getUncertainty(),
                0
              )}
              %
            </td>
            {printGrossImpact ? (
              <td  className="text-end">
                {printValue(
                  revenue.footprint.indicators[indic].getGrossImpact(
                    revenue.amount
                  ),
                  nbDecimals
                )}
                <span className="unit"> {unitGrossImpact}</span>
              </td>
            ) : null}
          </tr>
          {storedProduction != 0 && (
            <tr>
              <td>&emsp;Production stockée</td>
              <td  className="text-end" >
                {printValue(storedProduction.amount, 0)} &euro;
              </td>
              <td  className="text-end">
                {printValue(
                  storedProduction.footprint.indicators[indic].getValue(),
                  nbDecimals
                )} <span className="unit">{unit}</span>
              </td>
              <td  className="text-end" >
                <u>+</u>
                {printValue(
                  storedProduction.footprint.indicators[indic].getUncertainty(),
                  0
                )}
                %
              </td>
              {printGrossImpact ? (
                <td  className="text-end">
                  {printValue(
                    storedProduction.footprint.indicators[indic].getGrossImpact(
                      storedProduction.amount
                    ),
                    nbDecimals
                  )}
                  <span className="unit"> {unitGrossImpact}</span>
                </td>
              ) : null}
            </tr>
          )}
          {immobilisedProduction.amount > 0 && (
            <tr>
              <td>&emsp;Production immobilisée</td>
              <td  className="text-end">
                ({printValue(immobilisedProduction.amount, 0)}) &euro;
              </td>
              <td  className="text-end">
                {printValue(
                  immobilisedProduction.footprint.indicators[indic].getValue(),
                  nbDecimals
                )} <span className="unit">{unit}</span>
              </td>
              <td  className="text-end">
                <u>+</u>
                {printValue(
                  immobilisedProduction.footprint.indicators[
                    indic
                  ].getUncertainty(),
                  0
                )}
                %
              </td>
              {printGrossImpact ? (
                <td  className="text-end" >
                  (
                  {printValue(
                    immobilisedProduction.footprint.indicators[
                      indic
                    ].getGrossImpact(immobilisedProduction.amount),
                    nbDecimals
                  )}
                  )
                  <span className="unit"> {unitGrossImpact}</span>
                </td>
              ) : null}
            </tr>
          )}
          <tr className="with-top-line">
            <td className="font-weight-bold">Consommations intermédiaires</td>
            <td className="text-end">
              {printValue(intermediateConsumption.amount, 0)} &euro;
            </td>
            <td  className="text-end">
              {printValue(
                intermediateConsumption.footprint.indicators[indic].getValue(),
                nbDecimals
              )} <span className="unit">{unit}</span>
            </td>
            <td  className="text-end">
              <u>+</u>
              {printValue(
                intermediateConsumption.footprint.indicators[
                  indic
                ].getUncertainty(),
                0
              )}
              %
            </td>
            {printGrossImpact ? (
              <td  className="text-end">
                {printValue(
                  intermediateConsumption.footprint.indicators[
                    indic
                  ].getGrossImpact(intermediateConsumption.amount),
                  nbDecimals
                )}
                <span className="unit"> {unitGrossImpact}</span>
              </td>
            ) : null}
          </tr>

          {intermediateConsumptionsAggregates
            .filter((aggregate) => aggregate.amount != 0)
            .map(({ accountLib, amount, footprint }, index) => (
              <tr key={index}>
                <td>&emsp;{accountLib}</td>
                <td  className="text-end">{printValue(amount, 0)} &euro;</td>
                <td  className="text-end">
                  {printValue(
                    footprint.indicators[indic].getValue(),
                    nbDecimals
                  )} <span className="unit">{unit}</span>
                </td>
                <td  className="text-end">
                  <u>+</u>
                  {printValue(footprint.indicators[indic].getUncertainty(), 0)}
                  %
                </td>
                {printGrossImpact ? (
                  <td  className="text-end">
                    {printValue(
                      footprint.indicators[indic].getGrossImpact(amount),
                      nbDecimals
                    )}
                    <span className="unit"> {unitGrossImpact}</span>
                  </td>
                ) : null}
              </tr>
            ))}

          <tr className="with-top-line">
            <td className="font-weight-bold"> Consommations de capital fixe</td>
            <td  className="text-end">
              {printValue(capitalConsumption.amount, 0)} &euro;
            </td>
            <td  className="text-end">
              {printValue(
                capitalConsumption.footprint.indicators[indic].getValue(),
                nbDecimals
              )} <span className="unit">{unit}</span>
            </td>
            <td  className="text-end">
              <u>+</u>
              {printValue(
                capitalConsumption.footprint.indicators[indic].getUncertainty(),
                0
              )}
              %
            </td>
            {printGrossImpact ? (
              <td  className="text-end">
                {printValue(
                  capitalConsumption.footprint.indicators[indic].getGrossImpact(
                    capitalConsumption.amount
                  ),
                  nbDecimals
                )} <span className="unit"> {unitGrossImpact}</span>
              </td>
            ) : null}
          </tr>
          {fixedCapitalConsumptionsAggregates
            .filter((aggregate) => aggregate.amount != 0)
            .map(({ accountLib, amount, footprint }, index) => (
              <tr key={index}>
                <td>&emsp;{accountLib}</td>
                <td  className="text-end">{printValue(amount, 0)} &euro;</td>
                <td  className="text-end">
                  {printValue(
                    footprint.indicators[indic].getValue(),
                    nbDecimals
                  )} <span className="unit"> {unit} </span>
                </td>
                <td  className="text-end">
                  <u>+</u>
                  {printValue(footprint.indicators[indic].getUncertainty(), 0)}
                  %
                </td>
                {printGrossImpact ? (
                  <td  className="text-end">
                    {printValue(
                      footprint.indicators[indic].getGrossImpact(amount),
                      nbDecimals
                    )}
                    <span className="unit"> {unitGrossImpact}</span>
                  </td>
                ) : null}
              </tr>
            ))}
          <tr>
            <td className="font-weight-bold">Valeur ajoutée nette</td>
            <td  className="text-end">
              {printValue(netValueAdded.amount, 0)} &euro;
            </td>
            <td  className="text-end">
              {printValue(
                netValueAdded.footprint.indicators[indic].getValue(),
                nbDecimals
              )} <span className="unit">{unit}</span>
            </td>
            <td  className="text-end">
              <u>+</u>
              {printValue(
                netValueAdded.footprint.indicators[indic].getUncertainty(),
                0
              )}
              %
            </td>
            {printGrossImpact ? (
              <td  className="text-end">
                {printValue(
                  netValueAdded.footprint.indicators[indic].getGrossImpact(
                    netValueAdded.amount
                  ),
                  nbDecimals
                )}
                <span className="unit"> {unitGrossImpact}</span>
              </td>
            ) : null}

          </tr>
        </tbody>
      </Table>

    </>
  );
};

/* ----- GROUP FUNCTIONS ----- */

// External expenses
const getIntermediateConsumptionsAggregatesGroups = (financialData) => {
  let expensesGroups = financialData.getIntermediateConsumptionsAggregates();
  return expensesGroups;
};

// Depreciation expenses
const getFixedCapitalConsumptionsAggregatesGroups = (financialData) => {
  let expensesGroups = financialData.getFixedCapitalConsumptionsAggregates();
  return expensesGroups;
};
