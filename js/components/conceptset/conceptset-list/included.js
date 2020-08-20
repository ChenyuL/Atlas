define([
	'knockout',
	'text!./included.html',
	'components/Component',
	'utils/AutoBind',
	'utils/CommonUtils',
	'atlas-state',
	'services/ConceptSet',
	'../utils',
	'const',
	'components/conceptAddBox/concept-add-box',
	'../conceptset-list-modal'
], function (
	ko,
	view,
	Component,
	AutoBind,
	commonUtils,
	sharedState,
	conceptSetService,
	conceptSetUtils,
	globalConstants,
) {

	class IncludedConcepts extends AutoBind(Component){
		constructor(params) {
			super(params);
			this.canEdit = params.canEdit;
			this.conceptSetStore = params.conceptSetStore;
			this.includedConcepts = this.conceptSetStore.includedConcepts;
			this.commonUtils = commonUtils;
			this.loading = params.loading;
			this.includedConceptsColumns = globalConstants.getIncludedConceptsColumns(sharedState, { canEditCurrentConceptSet: this.canEdit }, commonUtils, conceptSetService, conceptSetUtils);
			this.includedConceptsOptions = globalConstants.includedConceptsOptions;
			this.canAddConcepts = ko.pureComputed(() => this.includedConcepts() && this.includedConcepts().some(item => item.isSelected()));

			this.ancestorsModalIsShown = ko.observable(false);
      this.ancestors = ko.observableArray([]);
			this.showAncestorsModal = conceptSetUtils.getAncestorsModalHandler({
				conceptSetStore: this.conceptSetStore,
				ancestors: this.ancestors,
				ancestorsModalIsShown: this.ancestorsModalIsShown
			});
	
		}

		addConcepts(options) {
			const concepts = commonUtils.getSelectedConcepts(this.includedConcepts);
			const items = commonUtils.buildConceptSetItems(concepts, options);
			conceptSetUtils.addItemsToConceptSet({
				items,
				conceptSetStore: this.conceptSetStore,
			});
			commonUtils.clearConceptsSelectionState(this.includedConcepts);
    }
	
	}

	return commonUtils.build('conceptset-list-included', IncludedConcepts, view);
});