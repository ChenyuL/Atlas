define([
	'knockout',
	'text!./conceptset-expression.html',
	'components/Component',
	'utils/AutoBind',
  'utils/CommonUtils',
  'utils/Renderers',
  'services/ConceptSet',
  'atlas-state',
  'const',
  'components/conceptLegend/concept-legend',
], function (
	ko,
	view,
	Component,
  AutoBind,
  commonUtils,
  renderers,
  conceptSetService,
  sharedState,
  globalConstants,
) {
	class ConceptsetExpression extends AutoBind(Component) {
		constructor(params) {
			super(params);
			this.selectedConcepts = sharedState.repositoryConceptSet.selectedConcepts;
      this.canEditCurrentConceptSet = params.canEditCurrentConceptSet;
      this.commonUtils = commonUtils;
      this.allExcludedChecked = ko.pureComputed(() => {
        return this.selectedConcepts().find(item => !item.isExcluded()) === undefined;
      });
      this.allDescendantsChecked = ko.pureComputed(() => {
        return this.selectedConcepts().find(item => !item.includeDescendants()) === undefined;
      });
      this.allMappedChecked = ko.pureComputed(() => {
        return this.selectedConcepts().find(item => !item.includeMapped()) === undefined;
      });

      this.conceptsForRemovalLength = ko.pureComputed(() => this.data().filter(concept => concept.isSelected()).length);
      this.data = ko.observable(this.normalizeData());
      this.areAllConceptsCheckedForRemoval = ko.pureComputed(() => this.conceptsForRemovalLength() === this.data().length);
      this.selectedConcepts.subscribe(val => this.data(this.normalizeData()));

      this.columns = [
        {
          class: 'text-center',
          orderable: false,
          render: () => renderers.renderCheckbox('isSelected'),
        },
        {
          data: 'concept.CONCEPT_ID',
        },
        {
          data: 'concept.CONCEPT_CODE',
        },
        {
          render: commonUtils.renderBoundLink,
        },
        {
          data: 'concept.DOMAIN_ID',
        },
        {
          data: 'concept.STANDARD_CONCEPT',
          visible: false,
        },
        {
          data: 'concept.STANDARD_CONCEPT_CAPTION',
        },
        {
          class: 'text-center',
          orderable: false,
          render: () => this.renderCheckbox('isExcluded'),
        },
        {
          class: 'text-center',
          orderable: false,
          render: () => this.renderCheckbox('includeDescendants'),
        },
        {
          class: 'text-center',
          orderable: false,
          render: () => this.renderCheckbox('includeMapped'),
        },
      ];
    }

    toggleExcluded() {
      this.selectAllConceptSetItems('isExcluded', this.allExcludedChecked());
    }

    toggleDescendants() {
      this.selectAllConceptSetItems('includeDescendants', this.allDescendantsChecked());
    }

    toggleMapped() {
      this.selectAllConceptSetItems('includeMapped', this.allMappedChecked());
    }

    normalizeData() {
      return this.selectedConcepts().map((concept, idx) => ({ ...concept, idx, isSelected: ko.observable(!!concept.isSelected) }));
    }

    toggleCheckbox(d, field) {
			commonUtils.toggleConceptSetCheckbox(
				this.canEditCurrentConceptSet,
				this.selectedConcepts,
				d,
				field,
				() => conceptSetService.resolveConceptSetExpression({ source: globalConstants.conceptSetSources.repository })
			);
    }

    renderCheckbox(field) {
      return commonUtils.renderConceptSetCheckbox(this.canEditCurrentConceptSet, field);
    }

    toggleSelectedConceptsForRemoval() {
        const areAllConceptsCheckedForRemoval = this.areAllConceptsCheckedForRemoval();
        this.data().forEach(concept => concept.isSelected(!areAllConceptsCheckedForRemoval));
    }

    removeConceptsFromConceptSet() {
      const conceptsForRemoval = this.data().filter(concept => concept.isSelected());
      const indexesForRemoval = conceptsForRemoval.map(concept => concept.idx);
      conceptSetService.removeConceptsFromConceptSet({
        concepts: conceptsForRemoval,
        source: globalConstants.conceptSetSources.repository
      });
      const data = this.data().filter((concept) => !indexesForRemoval.includes(concept.idx));
      this.data(data);
    }

		selectAllConceptSetItems(key, areAllSelected) {
			if (!this.canEditCurrentConceptSet()) {
				return;
      }
      this.selectedConcepts().forEach(concept => {
        concept[key](!areAllSelected);
      })
			conceptSetService.resolveConceptSetExpression({ source: globalConstants.conceptSetSources.repository });
    }

    navigateToSearchPage() {
      sharedState.activeConceptSet(sharedState.repositoryConceptSet);
      commonUtils.routeTo('#/search');
    }

	}

	return commonUtils.build('conceptset-expression', ConceptsetExpression, view);
});