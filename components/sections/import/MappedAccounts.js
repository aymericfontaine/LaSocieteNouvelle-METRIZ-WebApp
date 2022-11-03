import React, { useEffect, useState } from "react";
import { Table } from "react-bootstrap";

function MappedAccounts(props) {
  const accounts = Object.entries(props.meta.accounts);

  const depAccounts = accounts.filter(
    (account) =>
      /^28/.test(account) || /^29/.test(account) || /^39/.test(account)
  );
  const assetAccounts = accounts.filter(
    (account) => /^2(0|1)/.test(account) || /^3[0-8]/.test(account)
  );

  const [isDisabled, setIsDisabled] = useState(true);
  const [mappedAccounts, setMappedAccounts] = useState(
    props.meta.mappingAccounts
  );

  // disabled if one account is not mapped i.e. enabled if all accounts are mapped
  useEffect(() => {
    if (Object.values(mappedAccounts).some((it) => !it.accountAux)) {
      setIsDisabled(true);
    } else {
      setIsDisabled(false);
    }
  }, [isDisabled, mappedAccounts]);

  function handleOnchange(depAccountNum, nextAccountAuxNum) {
    // remove association if a dep/amort. account is already associated with account aux
    Object.entries(mappedAccounts).map(([key, { accountAux }]) => {
      if (
        key.substring(0, 2) == depAccountNum.substring(0, 2) &&
        accountAux == nextAccountAuxNum
      ) {
        Object.assign(mappedAccounts, {
          [key]: { accountAux: "", directMatching: false },
        });
      }
    });

    // add association
    Object.assign(mappedAccounts, {
      [depAccountNum]: { accountAux: nextAccountAuxNum, directMatching: true },
    });

    props.meta.mappingAccounts = mappedAccounts; // ?
    setMappedAccounts({ ...mappedAccounts });

    // check if all accounts are associated
    if (Object.values(mappedAccounts).some((it) => !it.accountAux)) {
      setIsDisabled(true);
    } else {
      setIsDisabled(false);
    }
  }

  return (
    <div>
      <h3 className="subtitle ">
        Associez les comptes d'amortissements et de dépréciations
      </h3>
      <Table size="lg" hover className="mt-3">
        <thead>
          <tr>
            <th>Numéro de compte</th>
            <th>Libellé du compte</th>
            <th></th>
            <th>Compte associé</th>
          </tr>
        </thead>
        <tbody>
          {depAccounts.map(([depAccountNum, depAccountLib], index) => (
            <tr key={index}>
              <td>{depAccountNum}</td>
              <td>{depAccountLib}</td>
              <td style={{width:'40px'}}>
                {!mappedAccounts[depAccountNum].directMatching && (
                  <IconWarning />
                )}
              </td>
              <td>
                <select
                  className="form-select"
                  onChange={(e) =>
                    handleOnchange(depAccountNum, e.target.value)
                  }
                  value={mappedAccounts[depAccountNum].accountAux || ""}
                >
                  <option value="">Sélectionner un compte...</option>
                  {assetAccounts
                    .filter(
                      ([assetAccountNum, _]) =>
                        assetAccountNum[0] == depAccountNum[0]
                    )
                    .map(([assetAccountNum, assetAccountLib], index) => (
                      <option key={index} value={assetAccountNum}>
                        {assetAccountNum} - {assetAccountLib}
                      </option>
                    ))}
                </select>
              </td>

            </tr>
          ))}
        </tbody>
      </Table>

      <div className="text-end">
        <button className="btn btn-primary me-2" onClick={() => props.return()}>
          <i className="bi bi-chevron-left"></i> Retour aux A-Nouveaux
        </button>
        <button
          className="btn btn-secondary"
          disabled={isDisabled}
          onClick={() => props.onClick()}
        >
          Valider mes données
          <i className="bi bi-chevron-right"></i>
        </button>
      </div>
    </div>
  );
}

export default MappedAccounts;

const IconWarning = () => {
  return (
    <span className="icon-warning" title="Informations à vérifier">
      <i className=" bi bi-exclamation-triangle "></i>
    </span>
  );
};
