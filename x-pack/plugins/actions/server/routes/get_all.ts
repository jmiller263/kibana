/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { IRouter } from 'kibana/server';
import { ILicenseState } from '../lib';
import { BASE_ACTION_API_PATH } from '../../common';
import { ActionsRequestHandlerContext, FindActionResult } from '../types';
import { verifyAccessAndContext } from './verify_access_and_context';
import { RewriteResponseCase } from './rewrite_request_case';

const rewriteBodyRes: RewriteResponseCase<FindActionResult[]> = (results) => {
  return results.map(({ actionTypeId, isPreconfigured, referencedByCount, ...res }) => ({
    ...res,
    connector_type_id: actionTypeId,
    is_preconfigured: isPreconfigured,
    referenced_by_count: referencedByCount,
  }));
};

export const getAllActionRoute = (
  router: IRouter<ActionsRequestHandlerContext>,
  licenseState: ILicenseState
) => {
  router.get(
    {
      path: `${BASE_ACTION_API_PATH}/connectors`,
      validate: {},
    },
    router.handleLegacyErrors(
      verifyAccessAndContext(licenseState, async function (context, req, res) {
        const actionsClient = context.actions.getActionsClient();
        const result = await actionsClient.getAll();
        return res.ok({
          body: rewriteBodyRes(result),
        });
      })
    )
  );
};
