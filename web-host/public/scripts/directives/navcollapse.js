app
  .directive('navCollapse', () => ({
    restrict: 'A',
    link($scope, $el) {
      const $dropdowns = $el.find('ul').parent('li');
      const $a = $dropdowns.children('a');
      const $notDropdowns = $el.children('li').not($dropdowns);
      const $notDropdownsLinks = $notDropdowns.children('a');
      const app = angular.element('.appWrapper');
      const sidebar = angular.element('#sidebar');
      const controls = angular.element('#controls');

      $dropdowns.addClass('dropdown');

      const $submenus = $dropdowns.find('ul >.dropdown');
      $submenus.addClass('submenu');

      $a.append('<i class="fa fa-plus"></i>');

      $a.on('click', function (event) {
        if (app.hasClass('sidebar-sm') || app.hasClass('sidebar-xs') || app.hasClass('hz-menu')) {
          return false;
        }

        const $this = angular.element(this);
        const $parent = $this.parent('li');
        const $openSubmenu = angular.element('.submenu.open');

        if (!$parent.hasClass('submenu')) {
          $dropdowns.not($parent).removeClass('open').find('ul').slideUp();
        }

        $openSubmenu.not($this.parents('.submenu')).removeClass('open').find('ul').slideUp();
        $parent.toggleClass('open').find('>ul').stop().slideToggle();
        event.preventDefault();
      });

      $dropdowns.on('mouseenter', () => {
        sidebar.addClass('dropdown-open');
        controls.addClass('dropdown-open');
      });

      $dropdowns.on('mouseleave', () => {
        sidebar.removeClass('dropdown-open');
        controls.removeClass('dropdown-open');
      });

      $notDropdownsLinks.on('click', () => {
        $dropdowns.removeClass('open').find('ul').slideUp();
      });

      const $activeDropdown = angular.element('.dropdown>ul>.active').parent();

      $activeDropdown.css('display', 'block');
    },
  }));
