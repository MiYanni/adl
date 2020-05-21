
/**
 * @description The default action when no rule from ipRules and from virtualNetworkRules match. This is only used after the bypass property has been evaluated.
 * @extensible
 */
export enum NetworkRuleAction {
    Allow = 'Allow',
    Deny = 'Deny'
}