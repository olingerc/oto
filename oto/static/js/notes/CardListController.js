'use strict';

app.controller('CardListController', ['$scope', '$filter', '$modal', 'Cards', 'thumbService', function($scope, $filter, $modal, Cards, thumbService) {

   $scope.selectCard = function(card) {
     //Inform the Cards service about the active card. The service is not used in the Card list view directly, only in the Card Header view
      if (Cards.getActiveCard() == card) {
         Cards.setActiveCard(null);
      } else {
        Cards.setActiveCard(card);
      }
   };

   //css for active card
   $scope.cardIsActive = function(card) {
      return card == Cards.getActiveCard() ? true : false;
   };

   $scope.startEditCard = function(card) {
      if ($scope.inArchive()) {
         return;
      }

      if (window.getSelection) { //Because of double click we select --> unselect
          window.getSelection().removeAllRanges();
      }
      else if (document.selection) {
          document.selection.empty();
      }

      Cards.setActiveCard(card);
      var modalInstance = $modal.open({
         templateUrl: '/static/partials/cardFormModal.html',
         controller: 'CardFormModalInstanceCtrl',
         scope: $scope,
         resolve: {
            CardToEdit:function() {
               return card;
            }
         }
      });
   };

   /**********
   *Sort groups //TODO: put into attribute directive for cardlist???
   ***********/

   $scope.$watch('cards', function() {
      getCardGroups();
   }, true);

   $scope.$watchCollection('[orderProp,activestack.title,query]', function() {
      getCardGroups();
   });

   function getCardGroups() {
      var  groupsObj = {},
           label;

      //Handle filtering
      var visibleCards = $scope.cards;
      visibleCards = $filter('handlearchive')(visibleCards, $scope.inArchive());
      visibleCards = $filter('bystackid')(visibleCards, $scope.search, $scope.inArchive());
      visibleCards = $filter('filter')(visibleCards, $scope.query); //These are the ones we watch for regrouping

      angular.forEach(visibleCards, function(card) {
         if ($scope.orderProp === 'title') {
            label = card.title.substring(0,1).toUpperCase();
         } else {
            label = getDateNoTime(card[$scope.orderProp.replace('-','')]);
         }

         if (!groupsObj[label]) {
            groupsObj[label] = [card];
         } else {
            groupsObj[label].push(card);
         }
      });

      $scope.cardGroups = [];
      angular.forEach(groupsObj, function(cards, label) {
         //sort within groups, otherwise new ones always appear at the end
         cards  = $filter('orderBy')(cards, $scope.orderProp);

         $scope.cardGroups.push({
            'label':label,
            'cards':cards
         });
      });
      if ($scope.orderProp === 'title') {
         $scope.cardGroups  = $filter('orderBy')($scope.cardGroups, 'label');
      } else {
         $scope.cardGroups  = $filter('orderBy')($scope.cardGroups, '-label');
      }
   }

   $scope.thumbService = thumbService;

}]);