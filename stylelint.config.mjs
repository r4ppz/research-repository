/** @type {import('stylelint').Config} */
export default {
  extends: [
    "stylelint-config-standard",
    "stylelint-config-recess-order"
  ],
  rules: {
    "selector-class-pattern": [
      "^[a-z][a-zA-Z0-9]*$|^[a-z0-9]+(-[a-z0-9]+)*$",
      {
        "message": "Selectors should use either camelCase or kebab-case naming convention"
      }
    ],
    "custom-property-pattern": [
      "^([a-z][a-zA-Z0-9]*|[a-z0-9]+(-[a-z0-9]+)*)$",
      {
        "message": "CSS custom properties should use either camelCase or kebab-case naming convention"
      }
    ],
    "selector-pseudo-class-no-unknown": [
      true,
      {
        "ignorePseudoClasses": ["global"]
      }
    ],
    "no-empty-source": null,
    "no-descending-specificity": null
  },
  overrides: [
    {
      "files": ["**/*.module.css"],
      "rules": {
        "selector-class-pattern": null
      }
    }
  ]
};